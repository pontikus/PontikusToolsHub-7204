"""Run against the managed dev server; Chrome must be installed."""
import asyncio, json, zipfile, io
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright

OUT = Path('/home/user/pontikus-checks/stage4')
OUT.mkdir(parents=True, exist_ok=True)
KINDS = ['review-poster', 'event-flyer', 'offer-board', 'job-post', 'notice', 'social-kit']

async def ready(page):
    await page.wait_for_function("document.querySelector('.preview-heading .mono')?.textContent.includes('UP TO DATE')", timeout=60000)

async def download(page, button, name):
    async with page.expect_download() as pending:
        await page.get_by_role('button', name=button, exact=True).click()
    file = await pending.value
    target = OUT / (name + Path(file.suggested_filename).suffix)
    await file.save_as(target)
    return target

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
        context = await browser.new_context(viewport={'width':390, 'height':844}, accept_downloads=True)
        page = await context.new_page()
        errors=[]
        page.on('pageerror', lambda e: errors.append(str(e)))
        image = OUT / 'local-photo.png'
        Image.new('RGB', (400,300), '#547f82').save(image)
        report={}
        for kind in KINDS:
            await page.goto(f'http://localhost:4200/tools/{kind}')
            await ready(page)
            assert 'SHORELINE BUSINESSES' in await page.locator('main > .eyebrow').inner_text()
            assert 'Pontikus Boatyard' in await page.title()
            assert await page.evaluate('document.documentElement.scrollWidth') == 390
            if kind=='offer-board':
                for _ in range(9): await page.get_by_role('button', name='Add item').click()
            if kind=='job-post':
                for _ in range(4): await page.get_by_role('button', name='Add requirement').click()
            for node in await page.locator('.maker-form input[type=text], .maker-form textarea').all():
                limit=int(await node.get_attribute('maxlength') or 60)
                await node.fill('W'*limit)
            if kind=='review-poster':
                assert await page.get_by_role('button',name='Download PNG',exact=True).is_disabled()
                await page.get_by_label('Review link (HTTPS required)').fill('http://example.com')
                assert await page.get_by_role('alert').filter(has_text='HTTPS').count()>0
                await page.get_by_label('Review link (HTTPS required)').fill('https://example.com/reviews?' + 'x' * (2048 - len('https://example.com/reviews?')))
            if kind=='event-flyer':
                await page.get_by_label('Start time',exact=True).fill('18:00')
                await page.get_by_label('End time',exact=True).fill('17:00')
                assert 'before' in await page.get_by_role('alert').inner_text()
                await page.get_by_label('End time',exact=True).fill('19:00')
            if kind=='notice':
                await page.get_by_label('Effective from',exact=True).fill('2026-10-12')
                await page.get_by_label('Effective until',exact=True).fill('2026-10-11')
                assert 'before' in await page.get_by_role('alert').inner_text()
                await page.get_by_label('Effective until',exact=True).fill('2026-10-13')
            upload=page.locator('input[type=file]')
            if await upload.count(): await upload.set_input_files(str(image))
            await ready(page)
            for style in ['Midnight','Studio','Classic']:
                await page.get_by_role('button',name=style,exact=False).click()
                await ready(page)
                await page.screenshot(path=str(OUT/f'{kind}-{style.lower()}.png'),full_page=True)
            sizes=await page.locator('.canvas-stage canvas').evaluate('(c)=>[c.width,c.height]')
            png=await download(page, 'Download PNGs' if kind in ['offer-board','social-kit'] else 'Download PNG',kind)
            pdf=await download(page,'Download PDF',kind)
            if kind=='offer-board':
                with zipfile.ZipFile(png) as z: assert len(z.namelist())==2
            if kind=='social-kit':
                with zipfile.ZipFile(png) as z:
                    expected=[(1080,1080),(1080,1350),(1080,1920)]
                    assert [Image.open(io.BytesIO(z.read(n))).size for n in z.namelist()] == expected
                    story=Image.open(io.BytesIO(z.read(z.namelist()[2]))).convert('RGB')
                    bg=story.getpixel((0,0))
                    assert story.crop((0,0,1080,250)).getextrema()==tuple((v,v) for v in bg)
                    assert story.crop((0,1670,1080,1920)).getextrema()==tuple((v,v) for v in bg)
                for size in ['1080x1080','1080x1350','1080x1920']:
                    await page.get_by_role('button',name=size,exact=True).click()
                    await download(page,f'Download {size} PNG',f'{kind}-{size}')
            elif kind!='offer-board':
                await page.get_by_label('Export format').select_option('a6' if kind=='review-poster' else 'social')
                await ready(page)
                expected=[1240,1748] if kind=='review-poster' else [1080,1350]
                assert await page.locator('.canvas-stage canvas').evaluate('(c)=>[c.width,c.height]')==expected
                await download(page,'Download PNG',f'{kind}-alternate')
                await download(page,'Download PDF',f'{kind}-alternate')
            report[kind]={'width':390,'sizes':sizes,'png':str(png),'pdf':str(pdf)}
        # Existing makers remain reachable and render with their original dimensions.
        for slug in ['postcard','passport','journal','photo-frame','media-kit','rate-card','credential-card','availability']:
            await page.goto(f'http://localhost:4200/tools/{slug}')
            await ready(page)
            assert await page.locator('.canvas-stage canvas').count() == 1
        await page.goto('http://localhost:4200/tools/social-kit?embed=1')
        await ready(page)
        assert await page.locator('.header').count()==0
        assert await page.locator('.back-link').count()==0
        assert await page.locator('.privacy-note').count()==1
        await page.get_by_label('Remove Pontikus frame').check()
        await ready(page)
        await page.evaluate("async () => { const {settings}=await import('/src/web/lib/catalogue.ts'); settings.gateFrameRemoval=true; }")
        await ready(page)
        assert await page.get_by_label('Remove Pontikus frame').is_disabled()
        assert not await page.get_by_label('Remove Pontikus frame').is_checked()
        await page.evaluate("async () => { const {settings}=await import('/src/web/lib/catalogue.ts'); settings.gateFrameRemoval=false; }")
        assert not errors, errors
        (OUT/'report.json').write_text(json.dumps(report,indent=2))
        print(json.dumps({'tools':list(report),'errors':errors,'outputs':str(OUT)},indent=2))
        await browser.close()

asyncio.run(main())
// Login gate for the pontikus.com (Brilliant Directories) copies of the Starter tools.
// BD runs PHP in widget content, so the check happens on the server: signed-in members
// get the tool's mount point, everyone else gets a sign-in panel. The member's plan is
// passed to the widget as data attributes so Levels 1-3 can unlock from it later.
import { esc } from "./core";

// Live BD subscription IDs → audience and level, as used by the Pontikus Dashboard widgets.
export const bdPlans: Record<number, [audience: string, level: string]> = {
  20: ["sea-lovers", "starter"],
  17: ["sea-lovers", "level1"],
  16: ["sea-lovers", "level2"],
  18: ["sea-lovers", "level3"],
  21: ["coastal-experts", "starter"],
  6: ["coastal-experts", "level1"],
  7: ["coastal-experts", "level2"],
  8: ["coastal-experts", "level3"],
  22: ["shoreline-businesses", "starter"],
  9: ["shoreline-businesses", "level1"],
  10: ["shoreline-businesses", "level2"],
  11: ["shoreline-businesses", "level3"],
};

export const bdLinks = { signIn: "/login", register: "/join" };

export type GateTool = { slug: string; name: string; promise: string; audienceName: string };

// The sign-in panel shown to visitors who are not signed in. Uses the widget's .pkst styles.
export function gatePanel(tool: GateTool) {
  return `<div class="pkst pkst-gate">
  <p class="pkst-eyebrow">${esc(tool.audienceName.toUpperCase())} · STARTER</p>
  <h3>${esc(tool.name)}</h3>
  <p class="pkst-intro">${esc(tool.promise)} Starter tools are open to every Pontikus member. Sign in, or register in a minute, to use it.</p>
  <div class="pkst-gate-actions">
    <a class="pkst-button" href="${esc(bdLinks.signIn)}">Sign in</a>
    <a class="pkst-button pkst-gold" href="${esc(bdLinks.register)}">Register</a>
  </div>
</div>`;
}

function phpPlanArray() {
  return Object.entries(bdPlans)
    .map(([id, [aud, level]]) => `${id}=>array('${aud}','${level}')`)
    .join(",");
}

// Full widget_data markup for BD: PHP login check around the mount point.
export function gatedMarkup(tool: GateTool) {
  const id = `pkst-${tool.slug}`;
  return `<?php
$pkstU = (!empty($_COOKIE['userid']) && function_exists('getUser')) ? getUser($_COOKIE['userid'], $w) : null;
if (is_array($pkstU) && !empty($pkstU['user_id'])) {
  $pkstPlans = array(${phpPlanArray()});
  $pkstSid = intval($pkstU['subscription_id']);
  $pkstP = isset($pkstPlans[$pkstSid]) ? $pkstPlans[$pkstSid] : array('', 'starter');
?>
<div id="${id}" data-member="1" data-audience="<?php echo $pkstP[0]; ?>" data-level="<?php echo $pkstP[1]; ?>"></div>
<?php } else { ?>
${gatePanel(tool)}
<?php } ?>`;
}

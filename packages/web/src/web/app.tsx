import { routerBase } from "./lib/asset";
import { Route, Router, Switch } from "wouter";
import Hub from "./pages/hub";
import Postcard from "./pages/postcard";
import Passport from "./pages/passport";
import Journal from "./pages/journal";
import PhotoFrame from "./pages/photo-frame";
import MediaKit from "./pages/media-kit";
import RateCard from "./pages/rate-card";
import CredentialCard from "./pages/credential-card";
import Availability from "./pages/availability";
import BusinessMaker from "./pages/business-maker";
import PlannedTool from "./pages/planned-tool";
import { Provider } from "./components/provider";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

function App() {
  return (
    <Provider>
      <Router base={routerBase}>
        <Switch>
          <Route path="/" component={Hub} />
          <Route path="/tools/postcard" component={Postcard} />
          <Route path="/tools/passport" component={Passport} />
          <Route path="/tools/journal" component={Journal} />
          <Route path="/tools/photo-frame" component={PhotoFrame} />
          <Route path="/tools/media-kit" component={MediaKit} />
          <Route path="/tools/rate-card" component={RateCard} />
          <Route path="/tools/credential-card" component={CredentialCard} />
          <Route path="/tools/availability" component={Availability} />
          <Route path="/tools/review-poster">{() => <BusinessMaker key="review-poster" kind="review-poster" />}</Route>
          <Route path="/tools/event-flyer">{() => <BusinessMaker key="event-flyer" kind="event-flyer" />}</Route>
          <Route path="/tools/offer-board">{() => <BusinessMaker key="offer-board" kind="offer-board" />}</Route>
          <Route path="/tools/job-post">{() => <BusinessMaker key="job-post" kind="job-post" />}</Route>
          <Route path="/tools/notice">{() => <BusinessMaker key="notice" kind="notice" />}</Route>
          <Route path="/tools/social-kit">{() => <BusinessMaker key="social-kit" kind="social-kit" />}</Route>
          <Route path="/tools/:slug" component={PlannedTool} />
          <Route component={PlannedTool} />
        </Switch>
      </Router>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;

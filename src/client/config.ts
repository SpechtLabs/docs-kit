import { defineClientConfig } from "vuepress/client";

import AsciinemaCast from "../../components/AsciinemaCast.vue";
import Contributors from "../../components/Contributors.vue";
import FileTree from "../../components/FileTree.vue";
import ListCompare from "../../components/ListCompare.vue";
import Projects from "../../components/Projects.vue";
import Releases from "../../components/Releases.vue";
import SwaggerUI from "../../components/SwaggerUI.vue";
import Terminal from "../../components/Terminal.vue";
import VPContributors from "../../components/VPContributors.vue";
import VPListCompare from "../../components/VPListCompare.vue";
import VPProjects from "../../components/VPProjects.vue";
import VPReleases from "../../components/VPReleases.vue";
import VPSwaggerUI from "../../components/VPSwaggerUI.vue";

export default defineClientConfig({
  enhance({ app }) {
    // Usable anywhere in Markdown
    app.component("AsciinemaCast", AsciinemaCast);
    app.component("Contributors", Contributors);
    app.component("FileTree", FileTree);
    app.component("ListCompare", ListCompare);
    app.component("Projects", Projects);
    app.component("Releases", Releases);
    app.component("SwaggerUI", SwaggerUI);
    app.component("Terminal", Terminal);

    // Home page sections (`type: VPContributors` in the home frontmatter)
    app.component("VPContributors", VPContributors);
    app.component("VPListCompare", VPListCompare);
    app.component("VPProjects", VPProjects);
    app.component("VPReleases", VPReleases);
    app.component("VPSwaggerUI", VPSwaggerUI);
  },
});

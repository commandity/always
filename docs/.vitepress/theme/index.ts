import { h, computed, watch, defineComponent } from "vue";
import { useData, useRoute, useRouter } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { showSidebar } from "./components/layout/sidebarStore";
import {
  showAside,
  originalAsideDisabled,
} from "./components/layout/asideStore";
import "@fontsource-variable/chiron-goround-tc";
import "./custom.css";
// LAYOUT
import BlogIndex from "./components/layout/BlogIndex.vue";
import VPNavBarSidebarToggle from "./components/layout/VPNavBarSidebarToggle.vue";
import VPNavBarAsideToggle from "./components/layout/VPNavBarAsideToggle.vue";
import HomeBillboard from "./components/layout/HomeBillboard.vue";
import HomeProfile from "./components/layout/HomeProfile.vue";
import HomeCitation from "./components/layout/HomeCitation.vue";
import CitationIndex from "./components/layout/CitationIndex.vue";
import GlowBackground from "./components/layout/GlowBackground.vue";
import AboutPage from "./components/layout/AboutPage.vue";
import FloatingBgmPlayer from "./components/layout/FloatingBgmPlayer.vue";
import PasswordGate from "./components/PasswordGate.vue";
// ANES
import AsaCalculator from "./components/anes/AsaCalculator.vue";
// PSYCHOLOGY
import Phq9Gad7Calculator from "./components/psy/Phq9Gad7Calculator.vue";
import Sf36Calculator from "./components/psy/Sf36Calculator.vue";
// NEURO
import GdsCalculator from "./components/neuro/GdsCalculator.vue";
import CdrCalculator from "./components/neuro/CdrCalculator.vue";
import NihssCalculator from "./components/neuro/NihssCalculator.vue";
import UpdrsCalculator from "./components/neuro/UpdrsCalculator.vue";
import Abcd2Calculator from "./components/neuro/Abcd2Calculator.vue";
import NpiCalculator from "./components/neuro/NpiCalculator.vue";
import WpiCalculator from "./components/neuro/WpiCalculator.vue";
import FastCalculator from "./components/neuro/FastCalculator.vue";
import CmaiCalculator from "./components/neuro/CmaiCalculator.vue";
import MmseCalculator from "./components/neuro/MmseCalculator.vue";
import CTSCalculator from "./components/neuro/CTSCalculator.vue";
import MigraineCalculator from "./components/neuro/MigraineCalculator.vue";
import VertigoEvaluator from "./components/neuro/VertigoEvaluator.vue";
import FibromyalgiaCalculator from "./components/neuro/FibromyalgiaCalculator.vue";
// ENT
import HearingHandicapCalculator from "./components/ent/HearingHandicapCalculator.vue";
import DupixentCalculator from "./components/ent/DupixentCalculator.vue";
import Snot22Calculator from "./components/ent/Snot22Calculator.vue";
import NoseCalculator from "./components/ent/NoseCalculator.vue";
import ESSCalculator from "./components/ent/ESSCalculator.vue";
import GrbasCalculator from "./components/ent/GrbasCalculator.vue";
import Vhi10Calculator from "./components/ent/Vhi10Calculator.vue";
import VoissCalculator from "./components/ent/VoissCalculator.vue";
import Eat10Calculator from "./components/ent/Eat10Calculator.vue";
import ENS6QCalculator from "./components/ent/ENS6QCalculator.vue";
import FoisCalculator from "./components/ent/FoisCalculator.vue";
import Etdq7Calculator from "./components/ent/Etdq7Calculator.vue";
import RsiCalculator from "./components/ent/RsiCalculator.vue";
import RfsCalculator from "./components/ent/RfsCalculator.vue";
import DhiCalculator from "./components/ent/DhiCalculator.vue";
import TfiCalculator from "./components/ent/TfiCalculator.vue";
import ThiCalculator from "./components/ent/ThiCalculator.vue";
import StopBangCalculator from "./components/ent/StopBangCalculator.vue";
import ThyroidSonographyReport from "./components/ent/ThyroidSonographyReport.vue";
// INFECTION
import Crb65Calculator from "./components/infection/Crb65Calculator.vue";
import CentorCalculator from "./components/infection/CentorCalculator.vue";
// CV
import Cha2ds2vaCalculator from "./components/cv/Cha2ds2vaCalculator.vue";
import PreventAscvdCalculator from "./components/cv/PreventAscvdCalculator.vue";
// RHEUMA
import Das28Calculator from "./components/rheuma/Das28Calculator.vue";
import FraxCalculator from "./components/rheuma/FraxCalculator.vue";
import CdaiCalculator from "./components/rheuma/CdaiCalculator.vue";
import Rapid3Calculator from "./components/rheuma/Rapid3Calculator.vue";
import BasdaiCalculator from "./components/rheuma/BasdaiCalculator.vue";
import AutoScreenCalculator from "./components/rheuma/AutoScreenCalculator.vue";
// NEPHRO
import AccessRecirculationCalculator from "./components/nephro/AccessRecirculationCalculator.vue";
import BicarbDeficitCalculator from "./components/nephro/BicarbDeficitCalculator.vue";
import DeltaDeltaCalculator from "./components/nephro/DeltaDeltaCalculator.vue";
import FractionalExcretionCalculator from "./components/nephro/FractionalExcretionCalculator.vue";
import H2oDeficitCalculator from "./components/nephro/H2oDeficitCalculator.vue";
import IvcBsaCalculator from "./components/nephro/IvcBsaCalculator.vue";
import KtvCalculator from "./components/nephro/KtvCalculator.vue";
import UreaReductionCalculator from "./components/nephro/UreaReductionCalculator.vue";
import MdrdCalculator from "./components/nephro/MdrdCalculator.vue";
// PAIN
import CarpalTunnelCalculator from "./components/pain/CarpalTunnelCalculator.vue";
import LowBackPainCalculator from "./components/pain/LowBackPainCalculator.vue";
import NeuropathicPainCalculator from "./components/pain/NeuropathicPainCalculator.vue";
import OswestryCalculator from "./components/pain/OswestryCalculator.vue";
import RolandMorrisCalculator from "./components/pain/RolandMorrisCalculator.vue";
// GERIATRIC
import GeriatricDepressionScaleCalculator from "./components/geria/GeriatricDepressionScaleCalculator.vue";
import ICOPEScreeningCalculator from "./components/geria/ICOPEScreeningCalculator.vue";
import CognitiveBHTAD8 from "./components/geria/CognitiveBHTAD8.vue";
import LocomotorSPPB from "./components/geria/LocomotorSPPB.vue";
import MNASFCalculator from "./components/geria/MNASFCalculator.vue";
import WhoVisionCalculator from "./components/geria/WhoVisionCalculator.vue";
// META
import LipidProtocolCalculator from "./components/lipid/LipidProtocolCalculator.vue";
import BasalEnergyExpenditureCalculator from "./components/meta/BasalEnergyExpenditureCalculator.vue";
import BSACalculator from "./components/meta/BSACalculator.vue";
import LevothyroxineCalculator from "./components/meta/LevothyroxineCalculator.vue";
import CalorieRequirementsCalculator from "./components/meta/CalorieRequirementsCalculator.vue";
import CalorieRequirementsTableCalculator from "./components/meta/CalorieRequirementsTableCalculator.vue";
import IdealBodyWeightCalculator from "./components/meta/IdealBodyWeightCalculator.vue";
import LeanBodyWeightCalculator from "./components/meta/LeanBodyWeightCalculator.vue";
import ScofieldBMRCalculator from "./components/meta/ScofieldBMRCalculator.vue";
import BasalInsulinTitrationCalculator from "./components/dm/BasalInsulinTitrationCalculator.vue";
import OhaSelectionGuide from "./components/dm/OhaSelectionGuide.vue";
// URO
import IPSSCalculator from "./components/uro/IPSSCalculator.vue";
import NIHCPSICalculator from "./components/uro/NIHCPSICalculator.vue";
// CLINIC
import ForeignerInquiry from "./components/clinic/ForeignerInquiry.vue";
import PregnancyCategoryTable from "./components/clinic/PregnancyCategoryTable.vue";
// GI
import FIB4Calculator from "./components/gi/FIB4Calculator.vue";
// CHEST
import PEFCalculator from "./components/chest/PEFCalculator.vue";
import CATCalculator from "./components/chest/CATCalculator.vue";

export default {
  ...DefaultTheme,
  Layout: defineComponent({
    setup() {
      const { frontmatter } = useData();
      const route = useRoute();
      const router = useRouter();
      const isHome = computed(() => frontmatter.value.layout === "home");

      watch(
        [() => showSidebar.value, () => showAside.value, () => route.path],
        ([, , path], [, , oldPath]) => {
          if (path !== oldPath) {
            originalAsideDisabled.value = frontmatter.value.aside === false;
          }
          router.route.data = {
            ...router.route.data,
            frontmatter: {
              ...router.route.data.frontmatter,
              sidebar: showSidebar.value,
              aside: originalAsideDisabled.value ? false : showAside.value,
            },
          };
        },
        { immediate: true },
      );

      return () => [
        h(FloatingBgmPlayer),
        h(PasswordGate, null, {
          default: () =>
            h(DefaultTheme.Layout, null, {
              "nav-bar-content-before": () => h(VPNavBarSidebarToggle),
              "nav-bar-content-after": () => h(VPNavBarAsideToggle),
              "home-features-after": () =>
                isHome.value
                  ? h("div", null, [
                      h(HomeBillboard),
                      h(HomeCitation),
                      h(HomeProfile),
                    ])
                  : null,
              "layout-top": () => (isHome.value ? h(GlowBackground) : null),
            }),
        }),
      ];
    },
  }),
  enhanceApp({ app }) {
    // LAYOUT
    app.component("BlogIndex", BlogIndex);
    app.component("HomeCitation", HomeCitation);
    app.component("HomeProfile", HomeProfile);
    app.component("CitationIndex", CitationIndex);
    app.component("HomeBillboard", HomeBillboard);
    app.component("GlowBackground", GlowBackground);
    app.component("AboutPage", AboutPage);
    // ANES
    app.component("AsaCalculator", AsaCalculator);
    // PSYCHOLOGY
    app.component("Phq9Gad7Calculator", Phq9Gad7Calculator);
    app.component("Sf36Calculator", Sf36Calculator);
    // NEURO
    app.component("GdsCalculator", GdsCalculator);
    app.component("CdrCalculator", CdrCalculator);
    app.component("NihssCalculator", NihssCalculator);
    app.component("UpdrsCalculator", UpdrsCalculator);
    app.component("Abcd2Calculator", Abcd2Calculator);
    app.component("NpiCalculator", NpiCalculator);
    app.component("WpiCalculator", WpiCalculator);
    app.component("FastCalculator", FastCalculator);
    app.component("CmaiCalculator", CmaiCalculator);
    app.component("MmseCalculator", MmseCalculator);
    app.component("CTSCalculator", CTSCalculator);
    app.component("MigraineCalculator", MigraineCalculator);
    app.component("VertigoEvaluator", VertigoEvaluator);
    app.component("FibromyalgiaCalculator", FibromyalgiaCalculator);
    // ENT
    app.component("HearingHandicapCalculator", HearingHandicapCalculator);
    app.component("DupixentCalculator", DupixentCalculator);
    app.component("Snot22Calculator", Snot22Calculator);
    app.component("NoseCalculator", NoseCalculator);
    app.component("ESSCalculator", ESSCalculator);
    app.component("GrbasCalculator", GrbasCalculator);
    app.component("Vhi10Calculator", Vhi10Calculator);
    app.component("VoissCalculator", VoissCalculator);
    app.component("Eat10Calculator", Eat10Calculator);
    app.component("ENS6QCalculator", ENS6QCalculator);
    app.component("FoisCalculator", FoisCalculator);
    app.component("Etdq7Calculator", Etdq7Calculator);
    app.component("RsiCalculator", RsiCalculator);
    app.component("RfsCalculator", RfsCalculator);
    app.component("DhiCalculator", DhiCalculator);
    app.component("TfiCalculator", TfiCalculator);
    app.component("ThiCalculator", ThiCalculator);
    app.component("StopBangCalculator", StopBangCalculator);
    app.component("ThyroidSonographyReport", ThyroidSonographyReport);
    // INFECTION
    app.component("Crb65Calculator", Crb65Calculator);
    app.component("CentorCalculator", CentorCalculator);
    // CV
    app.component("Cha2ds2vaCalculator", Cha2ds2vaCalculator);
    app.component("PreventAscvdCalculator", PreventAscvdCalculator);
    // RHEUMA
    app.component("Das28Calculator", Das28Calculator);
    app.component("FraxCalculator", FraxCalculator);
    app.component("CdaiCalculator", CdaiCalculator);
    app.component("Rapid3Calculator", Rapid3Calculator);
    app.component("BasdaiCalculator", BasdaiCalculator);
    app.component("AutoScreenCalculator", AutoScreenCalculator);
    // NEPHRO
    app.component(
      "AccessRecirculationCalculator",
      AccessRecirculationCalculator,
    );
    app.component("BicarbDeficitCalculator", BicarbDeficitCalculator);
    app.component("DeltaDeltaCalculator", DeltaDeltaCalculator);
    app.component(
      "FractionalExcretionCalculator",
      FractionalExcretionCalculator,
    );
    app.component("H2oDeficitCalculator", H2oDeficitCalculator);
    app.component("IvcBsaCalculator", IvcBsaCalculator);
    app.component("KtvCalculator", KtvCalculator);
    app.component("UreaReductionCalculator", UreaReductionCalculator);
    app.component("MdrdCalculator", MdrdCalculator);
    // PAIN
    app.component("CarpalTunnelCalculator", CarpalTunnelCalculator);
    app.component("LowBackPainCalculator", LowBackPainCalculator);
    app.component("NeuropathicPainCalculator", NeuropathicPainCalculator);
    app.component("OswestryCalculator", OswestryCalculator);
    app.component("RolandMorrisCalculator", RolandMorrisCalculator);
    // GERIATRIC
    app.component(
      "GeriatricDepressionScaleCalculator",
      GeriatricDepressionScaleCalculator,
    );
    app.component("ICOPEScreeningCalculator", ICOPEScreeningCalculator);
    app.component("CognitiveBHTAD8", CognitiveBHTAD8);
    app.component("LocomotorSPPB", LocomotorSPPB);
    app.component("MNASFCalculator", MNASFCalculator);
    app.component("WhoVisionCalculator", WhoVisionCalculator);
    // META
    app.component("LipidProtocolCalculator", LipidProtocolCalculator);
    app.component(
      "BasalEnergyExpenditureCalculator",
      BasalEnergyExpenditureCalculator,
    );
    app.component("BSACalculator", BSACalculator);
    app.component("LevothyroxineCalculator", LevothyroxineCalculator);
    app.component(
      "CalorieRequirementsCalculator",
      CalorieRequirementsCalculator,
    );
    app.component(
      "CalorieRequirementsTableCalculator",
      CalorieRequirementsTableCalculator,
    );
    app.component("IdealBodyWeightCalculator", IdealBodyWeightCalculator);
    app.component("LeanBodyWeightCalculator", LeanBodyWeightCalculator);
    app.component("ScofieldBMRCalculator", ScofieldBMRCalculator);
    app.component(
      "BasalInsulinTitrationCalculator",
      BasalInsulinTitrationCalculator,
    );
    app.component("OhaSelectionGuide", OhaSelectionGuide);
    // URO
    app.component("IPSSCalculator", IPSSCalculator);
    app.component("NIHCPSICalculator", NIHCPSICalculator);
    // GI
    app.component("FIB4Calculator", FIB4Calculator);
    // CLINIC
    app.component("ForeignerInquiry", ForeignerInquiry);
    app.component("PregnancyCategoryTable", PregnancyCategoryTable);
    // CHEST
    app.component("PEFCalculator", PEFCalculator);
    app.component("CATCalculator", CATCalculator);
  },
};

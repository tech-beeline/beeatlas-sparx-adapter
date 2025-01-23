import { CapabilityControllers } from "./capabilities-controllers.mjs";
import { GlossaryControllers } from "./glossary-controllers.mjs";
import { ProcessScenarioControllers } from "./scenario-controllers/index.mjs";
import { TechnicalCapabilitiesControllers } from "./tc-controllers/index.mjs";
import { SystemsControllers } from "./systems-constollers/index.mjs";
import { ObservabilityControllers } from "./observability-controllers/index.mjs";

export const CapabilityControllersInstance = new CapabilityControllers();
export const GlossaryControllersInstance = new GlossaryControllers();
export const TechnicalCapabilitiesControllersInstance = new TechnicalCapabilitiesControllers();
export const ProcessScenarioControllersInstance = new ProcessScenarioControllers();
export const SystemsControllersInstance = new SystemsControllers();
export const ObservabilityControllersInstance = new ObservabilityControllers();
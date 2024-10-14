import { CapabilityControllers } from "./capabilities-controllers.mjs";
import { GlossaryControllers } from "./glossary-controllers.mjs";
import { ProcessScenarioControllers } from "./scenario-controllers/index.mjs";
import { TechnicalCapabilitiesControllers } from "./tc-controllers.mjs";


export const CapabilityControllersInstance = new CapabilityControllers();
export const GlossaryControllersInstance = new GlossaryControllers();
export const TechnicalCapabilitiesControllersInstance = new TechnicalCapabilitiesControllers();
export const ProcessScenarioControllersInstance = new ProcessScenarioControllers();
import { createViewModel } from './main-view-model';
const frameModule = require("@nativescript/core/ui/frame");

export function onNavigatingTo(args) {
  const page = args.object;
  page.bindingContext = createViewModel();
}

export function onSupportTap() {
    console.log("Navegando a support-page");
    console.log("Ruta completa:", "support-page.xml");
    
    try {
        frameModule.topmost().navigate({
            moduleName: "support-page"
        });
    } catch (error) {
        console.error("Error al navegar:", error);
    }
}
import { Frame } from '@nativescript/core';

export function pageLoaded(args) {
    const page = args.object;
    console.log('Página de agradecimiento cargada.');
}

export function navigateToSupportPage() {
    Frame.topmost().navigate("support-page");
}

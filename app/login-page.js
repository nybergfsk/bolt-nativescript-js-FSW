import { Observable } from '@nativescript/core';

export function onNavigatingTo(args) {
    const page = args.object;
    const viewModel = new Observable();
    
    viewModel.email = "";
    viewModel.password = "";
    viewModel.message = "";
    
    viewModel.onLogin = () => {
        // Basic validation
        if (!viewModel.email || !viewModel.password) {
            viewModel.set('message', 'Please fill in all fields');
            return;
        }
        
        // Here you would typically handle the login logic
        // For now, we'll just navigate to the main page
        const frame = page.frame;
        frame.navigate('main-page');
    };
    
    page.bindingContext = viewModel;
}
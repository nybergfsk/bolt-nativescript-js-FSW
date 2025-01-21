import { Observable, ImageSource, ScrollView, Frame } from '@nativescript/core';
import * as imagepicker from '@nativescript/imagepicker';

export function onNavigatingTo(args) {
    const page = args.object;
    const viewModel = new Observable();
    
    // Initialize properties
    viewModel.timestamp = new Date().toLocaleString('sv-SE');
    viewModel.school = "";
    viewModel.contact = "";
    viewModel.description = "";
    viewModel.selectedImage = null;
    viewModel.imageBase64 = null;
    viewModel.isLoading = false;
    viewModel.errorMessage = "";
    viewModel.successMessage = "";
    
    viewModel.onSelectImage = async () => {
        try {
            const context = imagepicker.create({
                mode: "single"
            });
            
            const selection = await context.present();
            if (selection.length > 0) {
                const selected = selection[0];
                const imageSource = await ImageSource.fromAsset(selected);
                
                const compressedImageSource = await imageSource.resize(
                    imageSource.width * 0.5,
                    imageSource.height * 0.5,
                    "aspectFit"
                );
                
                const base64Image = compressedImageSource.toBase64String("jpeg", 80);
                viewModel.set('selectedImage', imageSource);
                viewModel.set('imageBase64', base64Image);
                console.log('Bilden vald och bearbetad korrekt');
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            viewModel.set('errorMessage', 'Kunde inte välja bild: ' + error.message);
        }
    };
    
    viewModel.onSubmit = async () => {
        console.log('Startar formulärinlämning...');
        
        if (!viewModel.get('school')) {
            viewModel.set('errorMessage', 'Förkolan är obligatorisk');
            return;
        }
        if (!viewModel.get('contact')) {
            viewModel.set('errorMessage', 'Kontaktperson är obligatorisk');
            return;
        }
        if (!viewModel.get('description')) {
            viewModel.set('errorMessage', 'Beskrivning är obligatorisk');
            return;
        }
        
        viewModel.set('isLoading', true);
        viewModel.set('errorMessage', '');
        viewModel.set('successMessage', '');
        
        try {
            const formData = new URLSearchParams();
            formData.append('school', viewModel.get('school') || '');
            formData.append('contact', viewModel.get('contact') || '');
            formData.append('description', viewModel.get('description') || '');
            formData.append('image', viewModel.get('imageBase64') || '');
            
            console.log('Initierar hämtningsbegäran...');
            const response = await fetch('https://script.google.com/macros/s/AKfycbyNWT7pbOWhM9Wt6qNfbuldJVqGSaOe9NxCFKyhkWzU_AMFaGGtWTzU9qr11ClnmOMLng/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });
            
            console.log('Svar mottaget, status:', response.status);
            const responseText = await response.text();
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('Fel parsed svar:', e);
                throw new Error('Fel i serverns svarsformat');
            }
            
            if (result.status === 'success') {
                viewModel.set('successMessage', 'Formuläret har skickats framgångsrikt!');
                
                viewModel.set('school', '');
                viewModel.set('contact', '');
                viewModel.set('description', '');
                viewModel.set('selectedImage', null);
                viewModel.set('imageBase64', null);
                viewModel.set('timestamp', new Date().toLocaleString('sv-SE'));
            } else {
                throw new Error(result.message || 'Ett fel uppstod vid inlämning av formuläret');
            }
        } catch (error) {
            console.error('Error completo:', error);
            viewModel.set('errorMessage', 'Ett fel uppstod: ' + error.message);
        } finally {
            viewModel.set('isLoading', false);
            console.log('Leveransprocessen är klar');
            Frame.topmost().navigate("tack");
        }
    };

    // Lógica para gestionar el foco y desplazamiento
    viewModel.onFocus = (args) => {
        const textField = args.object;
        const scrollView = page.getViewById("mainScrollView");

        setTimeout(() => {
            scrollView.scrollToVerticalOffset(textField.getLocationRelativeTo(scrollView).y, true);
        }, 300);
    };
    
    page.bindingContext = viewModel;
}

import { Observable, ImageSource } from '@nativescript/core';
import * as imagepicker from '@nativescript/imagepicker';

export function onNavigatingTo(args) {
    const page = args.object;
    const viewModel = new Observable();
    
    // Initialize properties
    viewModel.timestamp = new Date().toLocaleString('sv-SE');
    viewModel.name = "";
    viewModel.school = "";
    viewModel.contact = ""; // Añadido para coincidir con el XML
    viewModel.description = "";
    viewModel.selectedImage = null;
    viewModel.isLoading = false;
    viewModel.errorMessage = "";
    viewModel.successMessage = "";
    ;

    // Function to hide the keyboard and scroll to the end
    viewModel.onReturnPress = () => {
        const textField = page.getViewById("description");
        textField.dismissSoftInput(); // Hide the keyboard
        const scrollView = page.getViewById("mainScrollView");
        scrollView.scrollToVerticalOffset(scrollView.scrollableHeight, true); // Scroll to the end of the view
    };
    
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
                console.log('Imagen seleccionada y procesada correctamente');
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            viewModel.set('errorMessage', 'Kunde inte välja bild: ' + error.message);
        }
    };
    
    viewModel.onSubmit = async () => {
        console.log('Iniciando envío del formulario...');
        
        // Validación detallada
        if (!viewModel.get('school')) {
            viewModel.set('errorMessage', 'Förskola och Avdelning är obligatoriskt');
            return;
        }
        if (!viewModel.get('contact')) {
            viewModel.set('errorMessage', 'Kontaktperson är obligatoriskt');
            return;
        }
        if (!viewModel.get('description')) {
            viewModel.set('errorMessage', 'Beskrivning är obligatoriskt');
            return;
        }
        
        viewModel.set('isLoading', true);
        viewModel.set('errorMessage', '');
        viewModel.set('successMessage', '');
        
        try {
            // Crear objeto con los datos usando los nombres de campos correctos
            const formData = new URLSearchParams();
            formData.append('entry.2', viewModel.get('school') || '');  // Contacto en lugar de nombre
            formData.append('entry.3', viewModel.get('contact') || '');
            formData.append('entry.4', viewModel.get('description') || '');
            formData.append('image', viewModel.get('imageBase64') || '');

            // Log de verificación
            console.log('Datos a enviar:');
            console.log('entry.2 (school):', formData.get('entry.2'));
            console.log('entry.3 (contact):', formData.get('entry.3'));
            console.log('entry.4 (description):', formData.get('entry.4'));
            console.log('image exists:', !!formData.get('image'));
            
            console.log('Iniciando petición fetch...');
            const response = await fetch('https://script.google.com/macros/s/AKfycbxL39IQdvm6fAJHIy5pjen9LbVDVuaDyULpGOZd03zT_xPGsVoJkDQZbtVNQLfzh8uqXA/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });
            
            console.log('Respuesta recibida, status:', response.status);
            const responseText = await response.text();
            console.log('Respuesta texto:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
                console.log('Respuesta parseada:', result);
            } catch (e) {
                console.error('Error parseando respuesta:', e);
                throw new Error('Error en formato de respuesta del servidor');
            }
            
            if (result.status === 'success') {
                console.log('Envío exitoso, limpiando formulario');
                viewModel.set('successMessage', 'Formuläret har skickats framgångsrikt!');
                
                // Reset form
                viewModel.set('school', '');
                viewModel.set('contact', '');
                viewModel.set('description', '');
                viewModel.set('selectedImage', null);
                viewModel.set('imageBase64', null);
            } else {
                throw new Error(result.message || 'Ett fel uppstod vid inlämning av formuläret');
            }
        } catch (error) {
            console.error('Error completo:', error);
            viewModel.set('errorMessage', 'Ett fel uppstod: ' + error.message);
        } finally {
            viewModel.set('isLoading', false);
            console.log('Proceso de envío finalizado');
        }
    };
    
    page.bindingContext = viewModel;
}
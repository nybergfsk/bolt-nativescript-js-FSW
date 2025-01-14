import { Observable, ImageSource } from '@nativescript/core';
import * as imagepicker from '@nativescript/imagepicker';

export function onNavigatingTo(args) {
    const page = args.object;
    const viewModel = new Observable();
    
    // Initialize properties
    viewModel.timestamp = new Date().toLocaleString('sv-SE');
    viewModel.name = "";
    viewModel.school = "";
    viewModel.description = "";
    viewModel.selectedImage = null;
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
        if (!viewModel.get('name')) {
            viewModel.set('errorMessage', 'El nombre es obligatorio');
            return;
        }
        if (!viewModel.get('school')) {
            viewModel.set('errorMessage', 'La escuela es obligatoria');
            return;
        }
        if (!viewModel.get('description')) {
            viewModel.set('errorMessage', 'La descripción es obligatoria');
            return;
        }
        
        viewModel.set('isLoading', true);
        viewModel.set('errorMessage', '');
        viewModel.set('successMessage', '');
        
        try {
            // Crear objeto con los datos asegurándonos de obtener los valores actualizados
            const formData = new URLSearchParams();
            formData.append('timestamp', viewModel.get('timestamp') || '');
            formData.append('name', viewModel.get('name') || '');
            formData.append('school', viewModel.get('school') || '');
            formData.append('description', viewModel.get('description') || '');
            formData.append('image', viewModel.get('imageBase64') || '');

            // Log de verificación
            console.log('Datos a enviar:');
            console.log('timestamp:', formData.get('timestamp'));
            console.log('name:', formData.get('name'));
            console.log('school:', formData.get('school'));
            console.log('description:', formData.get('description'));
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
                viewModel.set('name', '');
                viewModel.set('school', '');
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
            console.log('Proceso de envío finalizado');
        }
    };
    
    page.bindingContext = viewModel;
}
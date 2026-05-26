// authService.js
export const authService = {
  async login(cedula, clave) {
    // La URL de tu controlador de Spring Boot
    const URL = 'http://localhost:8080/api/v1/users/login';

    const payload = {
      body: {
        cedula: cedula,
        clave: clave
      }
    };

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }

    // Retornamos el objeto Usuario (que incluye su Rol)
    return await response.json();
  }
};

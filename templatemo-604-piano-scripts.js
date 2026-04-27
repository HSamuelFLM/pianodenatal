<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro - Christmas Piano</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="templatemo-604-christmas-piano.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h2>Criar conta 🎄</h2>
                <p>Junte-se à magia do Natal</p>
            </div>
            
            <div class="error-message" id="errorMessage"></div>
            <div class="success-message" id="successMessage"></div>
            
            <form class="auth-form" id="registerForm">
                <div class="form-group">
                    <label for="name">Nome completo</label>
                    <input type="text" id="name" name="name" placeholder="Seu nome" required>
                </div>
                
                <div class="form-group">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" name="email" placeholder="seu@email.com" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Senha</label>
                    <input type="password" id="password" name="password" placeholder="••••••••" required>
                </div>
                
                <div class="form-group">
                    <label for="confirmPassword">Confirmar senha</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="••••••••" required>
                </div>
                
                <button type="submit" class="auth-btn">Registrar</button>
            </form>
            
            <div class="auth-links">
                <p>Já tem uma conta? <a href="login.html">Faça login</a></p>
                <a href="index.html" class="back-home">← Voltar para o início</a>
            </div>
        </div>
    </div>

    <script>
        // Sistema de registro (simulado com localStorage)
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validação básica
            if (password !== confirmPassword) {
                showError('As senhas não coincidem');
                return;
            }
            
            if (password.length < 6) {
                showError('A senha deve ter pelo menos 6 caracteres');
                return;
            }
            
            try {
                // Verificar se usuário já existe
                const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
                if (existingUsers.find(u => u.email === email)) {
                    showError('E-mail já cadastrado');
                    return;
                }
                
                // Salvar usuário
                const newUser = { 
                    id: Date.now(), 
                    name: name, 
                    email: email, 
                    password: password 
                };
                existingUsers.push(newUser);
                localStorage.setItem('users', JSON.stringify(existingUsers));
                
                showSuccess('Conta criada com sucesso! Redirecionando...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                showError('Erro ao conectar com o servidor');
            }
        });
        
        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
        
        function showSuccess(message) {
            const successDiv = document.getElementById('successMessage');
            successDiv.textContent = message;
            successDiv.style.display = 'block';
        }
    </script>
</body>
</html>

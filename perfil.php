<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Perfil do Usuário</title>
  <link rel="stylesheet" href="CSS/perfil.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <header>
    <div class="header-content">
      <nav>
        <a href="homepage.html"><i class="fas fa-question-circle"></i> HOMEPAGE</a>
        <a href="cursos.html"><i class="fas fa-book"></i> CURSOS</a>
        <a href="trilhas.html"><i class="fas fa-database"></i> TRILHAS</a>
        <img src="https://i.imgur.com/W8yZNOX.png" alt="Avatar" class="avatar">
      </nav>
    </div>
  </header>

  <div class="container-perfil">
    <div class="menu-perfil">
      <img src="imagens/pato2.png" alt="Avatar">
      <h2>???</h2>
      <blockquote>"Um espírito nobre engrandece o menor dos homens."</blockquote>

      <div class="grupo-formulario">
        <label>Nome <span class="etiqueta-editor">Editor</span></label>
        <input type="text" value="Chris Evans">
      </div>

      <div class="grupo-formulario">
        <label>Bio <span class="etiqueta-editor">Editor</span></label>
        <textarea rows="2">"Um espírito nobre engrandece o menor dos homens."</textarea>
      </div>

      <button class="botao-salvar">SALVAR <i class="fas fa-check"></i></button>

      <div class="deletar-conta">
        Deletar minha conta
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M3 6l3 18h12l3-18H3zm18-4H3v2h18V2z"/></svg>
      </div>
    </div>

    <div class="conteudo-perfil">
      <h1>Meu Perfil</h1>
      <!-- Conteúdo adicional do perfil pode ser adicionado aqui -->
    </div>
  </div>
</body>
</html>

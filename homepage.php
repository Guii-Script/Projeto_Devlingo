<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevLingo - Aprenda Programação de Forma Gamificada</title>
  <link rel="stylesheet" href="CSS/homepage.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  </head>
<body>
  <!-- Header -->
  <header id="header">
    <a href="#" class="logo">
      <i class="fas fa-code"></i>
      <span>Dev_lingo</span>
    </a>
    
    <nav class="nav-links">
      <a href="#features">RECURSOS</a>
      <a href="#trilhas">TRILHAS</a>
      <a href="#testimonials">DEPOIMENTOS</a>
      <a href="#about">SOBRE</a>
    </nav>
    
    <a href="login.php" class="cta-button">Entrar</a>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <div class="hero-text">
        <h1>Aprenda programação de forma gamificada</h1>
        <p>Domine as linguagens de programação mais demandadas do mercado enquanto se diverte com desafios, conquistas e recompensas.</p>
        <div class="hero-buttons">
          <a href="cadastro.php" class="cta-button">Comece Agora</a>
          <a href="#features" class="secondary-button">Saiba Mais</a>
        </div>
      </div>
      <div class="hero-image">
        <img src="imagens/pato2.png" alt="Plataforma DevLingo">
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features" id="features">
    <h2 class="section-title">Por que escolher o DevLingo?</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-gamepad"></i>
        </div>
        <h3>Aprendizado Gamificado</h3>
        <p>Transformamos conceitos complexos em desafios divertidos com sistemas de pontos, níveis e recompensas.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-road"></i>
        </div>
        <h3>Trilhas Personalizadas</h3>
        <p>Caminhos de aprendizado estruturados para diferentes linguagens e níveis de habilidade.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-trophy"></i>
        </div>
        <h3>Sistema de Conquistas</h3>
        <p>Desbloqueie medalhas e troféus ao completar desafios e dominar conceitos importantes.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-heart"></i>
        </div>
        <h3>Vidas e Desafios</h3>
        <p>Sistema de vidas que incentiva a aprendizagem consistente e a revisão de conceitos.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <h3>Progresso Visual</h3>
        <p>Acompanhe seu desenvolvimento com gráficos e métricas detalhadas do seu aprendizado.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-users"></i>
        </div>
        <h3>Comunidade Ativa</h3>
        <p>Conecte-se com outros aprendizes, compartilhe conquistas e participe de desafios em grupo.</p>
      </div>
    </div>
  </section>

  <!-- Trilhas Section -->
  <section class="trilhas" id="trilhas">
    <div class="trilhas-container">
      <h2 class="section-title">Nossas Trilhas de Aprendizado</h2>
      <div class="trilhas-grid">
        <div class="trilha-card">
          <div class="trilha-header">
            <i class="fab fa-html5 trilha-icon"></i>
            <h3>HTML & CSS</h3>
          </div>
          <div class="trilha-body">
            <p>Domine a estruturação e estilização de páginas web com os pilares do desenvolvimento front-end.</p>
            <div class="trilha-progress">
              <div class="progress-bar" style="width: 75%"></div>
            </div>
            <div class="trilha-stats">
              <span>15/20 lições</span>
              <span>75% completo</span>
            </div>
          </div>
        </div>
        
        <div class="trilha-card">
          <div class="trilha-header">
            <i class="fab fa-js trilha-icon"></i>
            <h3>JavaScript</h3>
          </div>
          <div class="trilha-body">
            <p>Aprenda a linguagem da web interativa, desde o básico até conceitos avançados de programação.</p>
            <div class="trilha-progress">
              <div class="progress-bar" style="width: 30%"></div>
            </div>
            <div class="trilha-stats">
              <span>6/20 lições</span>
              <span>30% completo</span>
            </div>
          </div>
        </div>
        
        <div class="trilha-card">
          <div class="trilha-header">
            <i class="fab fa-python trilha-icon"></i>
            <h3>Python</h3>
          </div>
          <div class="trilha-body">
            <p>Descubra o poder desta linguagem versátil, ideal para iniciantes e projetos complexos.</p>
            <div class="trilha-progress">
              <div class="progress-bar" style="width: 10%"></div>
            </div>
            <div class="trilha-stats">
              <span>2/20 lições</span>
              <span>10% completo</span>
            </div>
          </div>
        </div>
        
        <div class="trilha-card">
          <div class="trilha-header">
            <i class="fas fa-database trilha-icon"></i>
            <h3>Banco de Dados</h3>
          </div>
          <div class="trilha-body">
            <p>Aprenda SQL e NoSQL para armazenar e gerenciar dados de forma eficiente em seus projetos.</p>
            <div class="trilha-progress">
              <div class="progress-bar" style="width: 5%"></div>
            </div>
            <div class="trilha-stats">
              <span>1/20 lições</span>
              <span>5% completo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section class="testimonials" id="testimonials">
    <div class="testimonials-container">
      <h2 class="section-title">O que nossos alunos dizem</h2>
      <div class="testimonials-grid">
        <div class="testimonial-card">
          <div class="testimonial-text">
            O DevLingo transformou minha jornada de aprendizado. Finalmente consegui manter a consistência estudando programação!
          </div>
          <div class="testimonial-author">
            <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Ana Silva" class="author-avatar">
            <div class="author-info">
              <h4>Ana Silva</h4>
              <p>Desenvolvedora Front-end</p>
            </div>
          </div>
        </div>
        
        <div class="testimonial-card">
          <div class="testimonial-text">
            Nunca imaginei que aprender banco de dados poderia ser tão divertido. Os desafios gamificados me mantêm motivado!
          </div>
          <div class="testimonial-author">
            <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="Carlos Oliveira" class="author-avatar">
            <div class="author-info">
              <h4>Carlos Oliveira</h4>
              <p>Estudante de Ciência da Computação</p>
            </div>
          </div>
        </div>
        
        <div class="testimonial-card">
          <div class="testimonial-text">
            Como professor, recomendo o DevLingo para meus alunos. A abordagem gamificada acelera o aprendizado de forma significativa.
          </div>
          <div class="testimonial-author">
            <img src="https://randomuser.me/api/portraits/men/22.jpg" alt="Prof. Ricardo" class="author-avatar">
            <div class="author-info">
              <h4>Prof. Ricardo</h4>
              <p>Instrutor de Programação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta-section">
    <div class="cta-container">
      <h2>Pronto para transformar seu aprendizado?</h2>
      <p>Junte-se a milhares de desenvolvedores que estão acelerando suas carreiras com o DevLingo.</p>
      <a href="cadastro.php" class="cta-button">Comece Agora - É Grátis!</a>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="footer-container">
      <div class="footer-about">
        <div class="footer-logo">
          <i class="fas fa-code"></i>
          <span>Dev_lingo</span>
        </div>
        <p>Aprenda programação de forma gamificada e divertida. Transforme seu aprendizado em uma aventura!</p>
        <div class="social-links">
          <a href="#"><i class="fab fa-facebook-f"></i></a>
          <a href="#"><i class="fab fa-twitter"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
          <a href="#"><i class="fab fa-linkedin-in"></i></a>
          <a href="#"><i class="fab fa-youtube"></i></a>
        </div>
      </div>
      
      <div class="footer-links">
        <h3>Links Rápidos</h3>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#features">Recursos</a></li>
          <li><a href="#trilhas">Trilhas</a></li>
          <li><a href="#testimonials">Depoimentos</a></li>
          <li><a href="#">Preços</a></li>
        </ul>
      </div>
      
      <div class="footer-links">
        <h3>Trilhas</h3>
        <ul>
          <li><a href="#">HTML & CSS</a></li>
          <li><a href="#">JavaScript</a></li>
          <li><a href="#">Python</a></li>
          <li><a href="#">Banco de Dados</a></li>
          <li><a href="#">React</a></li>
        </ul>
      </div>
      
      <div class="footer-newsletter">
        <h3>Dicas do Pato</h3>
        <p>Assine para receber dicas e atualizações.</p>
        <input type="email" placeholder="Seu melhor e-mail">
        <button type="submit">Assinar</button>
      </div>
    </div>
    
    <div class="copyright">
      &copy; 2025 DevLingo. Todos os direitos reservados.
    </div>
  </footer>

  <script>
    // Animação de scroll para o header
    window.addEventListener('scroll', function() {
      const header = document.getElementById('header');
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Animação de revelação ao scroll
    function checkVisibility() {
      const elements = document.querySelectorAll('.feature-card, .trilha-card, .testimonial-card');
      
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
          element.classList.add('visible');
        }
      });
    }

    // Animar barras de progresso quando visíveis
    function animateProgressBars() {
      const progressBars = document.querySelectorAll('.progress-bar');
      
      progressBars.forEach(bar => {
        const barPosition = bar.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (barPosition < screenPosition) {
          const width = bar.style.width;
          bar.style.width = '0';
          setTimeout(() => {
            bar.style.width = width;
          }, 100);
        }
      });
    }

    // Event listeners
    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('scroll', animateProgressBars);
    window.addEventListener('load', checkVisibility);
    window.addEventListener('load', animateProgressBars);

    // Suavizar scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  </script>
</body>
</html>
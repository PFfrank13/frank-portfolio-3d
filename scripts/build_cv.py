#!/usr/bin/env python3
"""Genera cv/Frank_Pineda_CV.pdf (A4, 1 página) y src/assets/cv-preview.png con los datos de Frank.

    python3 scripts/build_cv.py

Edita DATA aquí abajo para cambiar el contenido. Necesita Playwright (Chromium) y Pillow.
Solo incluye lo que Frank declaró en su CV (proyectos, formación, certificados, herramientas).
"""
import base64, os, tempfile
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'src', 'assets', 'fonts')
PHOTO = os.path.join(ROOT, 'src', 'assets', 'image_c70791.png')
OUT_PDF = os.path.join(ROOT, 'cv', 'Frank_Pineda_CV.pdf')
OUT_PNG = os.path.join(ROOT, 'src', 'assets', 'cv-preview.png')

DATA = {
    'name': 'Frank Farid Yampier Pineda Ferro',
    'role': 'Full-Stack Software Engineer · Ingeniero de Software con IA',
    'contact': [
        ('Correo', 'pinedaferrof@gmail.com'),
        ('Teléfono / WhatsApp', '+51 928 471 762'),
        ('LinkedIn', 'linkedin.com/in/frank-pineda-ferro-8960343a5'),
        ('GitHub', 'github.com/Subaru-Natsuki'),
        ('Ubicación', 'Subtanjalla, Ica, Perú'),
    ],
    'summary': 'Ingeniero de Software con especialización en Inteligencia Artificial. Egresado de SENATI y estudiante de Ingeniería de Software en la UTP, '
               'con convalidación académica por mérito técnico. Experiencia práctica en arquitectura de sistemas, programación orientada a objetos, '
               'optimización de bases de datos y desarrollo full stack. Me especializo en agentes autónomos, automatización con IA local y diseño '
               'estructurado de prompts. Resuelvo problemas complejos y construyo sistemas empresariales escalables, del hardware a la interfaz.',
    'projects': [
        ('Hospital Regional — acceso y autenticación con ID-Card NFC', 'Python · Keycloak · Arduino · NFC',
         ['Diseñé e implementé un sistema unificado de inicio de sesión y control de acceso para hardware médico y administrativo.',
          'Integré hardware y software para reforzar la seguridad del entorno y la trazabilidad de los usuarios.']),
        ('Agentes de IA autónomos — Jarvis y Viernes (desarrollo independiente)', 'Python · Ollama · Playwright · Claude Code CLI · Voiceflow',
         ['Desarrollé prototipos de agentes autónomos que ejecutan tareas automatizadas en entornos locales de Windows.',
          'Integré y optimicé flujos con modelos de lenguaje, considerando las limitaciones del hardware local.']),
        ('ELLA — reconocimiento de voz offline en Android', 'Kotlin · Android · Vosk · Whisper',
         ['Motor de reconocimiento de voz que funciona sin conexión, con asistentes locales basados en Ollama y Whisper.']),
        ('AgroSoft — sistema industrial y logístico', 'Java · C++',
         ['Participé en la revisión estructural y la gestión de reportes técnicos de las fases 1 y 2.',
          'Organicé y di seguimiento a la documentación técnica asociada al avance del sistema.']),
    ],
    'education': [
        ('SENATI', 'Ingeniería de Software con Inteligencia Artificial (carrera técnica)', 'Egresado'),
        ('Universidad Tecnológica del Perú (UTP)', 'Ingeniería de Software (pregrado) · convalidación por mérito académico', 'En curso'),
    ],
    'certs': [
        ('AWS Academy Graduate — Cloud Operations', 'Amazon Web Services Training and Certification · oct. 2025'),
        ('AWS Academy Graduate — Cloud Foundations', 'Amazon Web Services Training and Certification · sept. 2025'),
        ('Introduction to IoT', 'Cisco Networking Academy · mayo 2023'),
    ],
    'skills': [
        ('Lenguajes', 'Python, Java (POO avanzada, nivel competitivo), JavaScript, Kotlin, C++, SQL'),
        ('Web y backend', 'React, Node.js, FastAPI, HTML5, CSS3'),
        ('Arquitectura y DevOps', 'Docker, Git, Keycloak, OpenTelemetry, AWS (fundamentos y operaciones)'),
        ('IA y datos', 'Ollama, Whisper, Google AI Studio, Claude Code CLI, Voiceflow, Kaggle, prompt engineering, LLM locales'),
        ('IoT y móvil', 'Arduino, RFID / NFC, Android, Genymotion'),
    ],
    'languages': 'Español (nativo)',
}


def b64(p):
    return base64.b64encode(open(p, 'rb').read()).decode()


def html():
    d = DATA
    f = lambda n: b64(os.path.join(FONTS, n))
    contact = ''.join(f'<li><small>{k}</small>{v}</li>' for k, v in d['contact'])
    def proj(t, tech, bullets):
        li = ''.join(f'<li>{x}</li>' for x in bullets)
        return f'<div class="pj"><h4>{t}</h4><p class="tech">{tech}</p><ul>{li}</ul></div>'
    projs = ''.join(proj(*x) for x in d['projects'])
    skills = ''.join(f'<div class="sk"><small>{k}</small>{v}</div>' for k, v in d['skills'])
    edu = ''.join(f'<div class="pj"><h4>{a}</h4><p class="sub">{b} <span class="st">{c}</span></p></div>' for a, b, c in d['education'])
    certs = ''.join(f'<div class="pj"><h4>{a}</h4><p class="sub">{b}</p></div>' for a, b in d['certs'])
    return f"""<!doctype html><meta charset="utf-8"><style>
@font-face{{font-family:D;src:url(data:font/woff2;base64,{f('bricolage-grotesque-latin-wght-normal.woff2')});font-weight:200 800}}
@font-face{{font-family:B;src:url(data:font/woff2;base64,{f('instrument-sans-latin-wght-normal.woff2')});font-weight:400 700}}
@page{{size:A4;margin:0}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:210mm;height:297mm;background:#fff;color:#141414;font:8.6pt/1.42 B}}
.pg{{display:grid;grid-template-columns:60mm 1fr;height:297mm}}
aside{{background:#141516;color:#e9e5db;padding:12mm 7.5mm}}
aside img{{width:100%;aspect-ratio:1/1.2;object-fit:cover;object-position:50% 12%;border-radius:2px;filter:grayscale(1);display:block}}
aside h3{{font:600 8pt D;letter-spacing:.1em;text-transform:uppercase;color:#d5b05a;margin:7mm 0 2.6mm}}
aside ul{{list-style:none}} aside li{{margin-bottom:2.6mm;font-size:8.2pt;overflow-wrap:anywhere}}
small{{display:block;font-size:6.9pt;color:#8d8e92;letter-spacing:.03em}}
aside .sk{{margin-bottom:2.6mm;font-size:8.2pt}}
main{{padding:12mm 11mm 10mm 11mm}}
h1{{font:600 22pt/1.04 D;letter-spacing:-.025em}}
.role{{font:500 10.5pt D;color:#6b6a65;margin-top:1.6mm}}
.rule{{width:15mm;height:1.1mm;background:#b88f34;margin:4mm 0 4.5mm}}
h2{{font:600 8.4pt D;letter-spacing:.12em;text-transform:uppercase;color:#6b6a65;margin:5.6mm 0 2.4mm;border-bottom:.3mm solid #d8d4c8;padding-bottom:1.2mm}}
.pj{{margin-bottom:3.2mm}} h4{{font:600 9.6pt D;letter-spacing:-.01em}}
.tech{{font:500 7.6pt B;color:#8a6a1f;margin:.4mm 0 .8mm}} p{{color:#33322f}}
.sub{{color:#4d4c48}} .st{{font-weight:600;color:#8a6a1f;margin-left:1.5mm}}
main ul{{margin-left:3.6mm}} main li{{margin-bottom:.5mm;color:#33322f}}
</style><div class="pg"><aside>
<img src="data:image/png;base64,{b64(PHOTO)}">
<h3>Contacto</h3><ul>{contact}</ul>
<h3>Habilidades técnicas</h3>{skills}
<h3>Idiomas</h3><div class="sk">{d['languages']}</div>
</aside><main>
<h1>{d['name']}</h1><p class="role">{d['role']}</p><div class="rule"></div>
<p>{d['summary']}</p>
<h2>Proyectos y experiencia técnica</h2>{projs}
<h2>Educación</h2>{edu}
<h2>Certificaciones</h2>{certs}
</main></div>"""


def main():
    os.makedirs(os.path.dirname(OUT_PDF), exist_ok=True)
    tmp = tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html()); tmp.close()
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 794, 'height': 1123}, device_scale_factor=1.6)
        pg.goto('file://' + tmp.name); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(300)
        pg.pdf(path=OUT_PDF, format='A4', print_background=True, margin={'top': '0', 'right': '0', 'bottom': '0', 'left': '0'})
        pg.screenshot(path=OUT_PNG, clip={'x': 0, 'y': 0, 'width': 794, 'height': 1123})
        b.close()
    os.unlink(tmp.name)
    print(OUT_PDF, os.path.getsize(OUT_PDF) // 1024, 'KB')


if __name__ == '__main__':
    main()

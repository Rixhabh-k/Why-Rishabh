// Lenis code 



gsap.registerPlugin(ScrollTrigger);

const { Engine, Runner, World, Bodies, Body, Mouse, MouseConstraint } = Matter;

const container = document.getElementById('physics-container');
const WIDTH = container.clientWidth;
const HEIGHT = container.clientHeight;

// create physics engine with zero gravity initially
const engine = Engine.create();
engine.gravity.y = 0; // hold still until scroll trigger
const world = engine.world;

// add four boundaries (bounded container)
const thickness = 50;
const floor = Bodies.rectangle(WIDTH / 2, HEIGHT + thickness / 2, WIDTH, thickness, { isStatic: true, restitution: 0.4, friction: 0.1 });
const ceiling = Bodies.rectangle(WIDTH / 2, -thickness / 2, WIDTH, thickness, { isStatic: true });
const leftWall = Bodies.rectangle(-thickness / 2, HEIGHT / 2, thickness, HEIGHT, { isStatic: true });
const rightWall = Bodies.rectangle(WIDTH + thickness / 2, HEIGHT / 2, thickness, HEIGHT, { isStatic: true });

World.add(world, [floor, ceiling, leftWall, rightWall]);

// skill list
const SKILLS = [
    'HTML', 'CSS', 'JavaScript', 'React', 'GSAP',
    'Node.js', 'Express', 'MongoDB', 'REST API',
    'Git', 'Figma', 'TypeScript'
];

const bodies = [];
const elementMap = new Map();

SKILLS.forEach((skill) => {
    const el = document.createElement('div');
    el.className = 'skill-pill';
    el.innerHTML = `<span>${skill}</span>     `;
    container.appendChild(el);

    // measure size
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // create corresponding physics body
    const body = Bodies.rectangle(
        Math.random() * (WIDTH - 140) + 70,
        Math.random() * 100 + 20,
        width,
        height,
        {
            restitution: 0.35,
            friction: 0.02,
            frictionAir: 0.02,
            density: 0.002,
            chamfer: { radius: Math.min(width, height) / 2 }
        }
    );
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: 0 });
    World.add(world, body);
    bodies.push(body);
    elementMap.set(body, { el, w: width, h: height });
});

// mouse grabbing/throwing
const mouse = Mouse.create(container);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
        stiffness: 0.15,
        render: { visible: false },
        angularStiffness: 0.9
    }
});
World.add(world, mouseConstraint);
container.style.touchAction = 'pan-y';

// start physics runner
const runner = Runner.create();
Runner.run(runner, engine);

// sync DOM to physics state
(function render() {
    bodies.forEach(body => {
        const info = elementMap.get(body);
        if (!info) return;
        const { el, w, h } = info;
        const pos = body.position;
        const angle = body.angle;
        el.style.transform = `translate(${pos.x - w / 2}px, ${pos.y - h / 2}px) rotate(${angle}rad)`;
    });
    requestAnimationFrame(render);
})();

// GSAP ScrollTrigger: when section enters view, ramp gravity from 0 to 1
ScrollTrigger.create({
    trigger: '#about-skills-section',
    start: 'top 20%',
    once: true,
    //   markers: true,
    onEnter: () => {
        gsap.to(engine.gravity, {
            duration: 0.8,
            y: 1,
            ease: 'power2.out',

        });
    }
});



function safeParse(str, fallback) {
      try { return JSON.parse(str); }
      catch { return fallback; }
    }

    const popup = document.querySelector('.image-popup');
    const imagesWrapper = popup.querySelector('.images-wrapper');
    const titleEl = popup.querySelector('.popup-title');

    let current = null;
    let moveListener = null;
    let showTimeout = null;

    function showPopup(proj, evt) {
      const images = safeParse(proj.getAttribute('data-images') || '[]', []);
      const title = proj.getAttribute('data-title') || '';

      if (!images.length) return;

      imagesWrapper.innerHTML = '';
      images.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = title + ' preview';
        imagesWrapper.appendChild(img);
      });
      titleEl.textContent = title;

      gsap.set(popup, {
        x: evt.clientX + 18,
        y: evt.clientY + 18,
        scale: 0.9,
        opacity: 0
      });

      gsap.killTweensOf(popup);
      gsap.to(popup, {
        duration: 0.35,
        opacity: 1,
        scale: 1,
        ease: "power3.out",
        onStart() {
          popup.setAttribute('aria-hidden', 'false');
        }
      });

      moveListener = (e) => {
        gsap.to(popup, {
          duration: 0.28,
          x: e.clientX + 18,
          y: e.clientY + 18,
          ease: "power3.out",
          overwrite: "auto"
        });
      };
      window.addEventListener('mousemove', moveListener);
    }

    function hidePopup() {
      clearTimeout(showTimeout);
      gsap.killTweensOf(popup);
      gsap.to(popup, {
        duration: 0.25,
        opacity: 0,
        scale: 0.9,
        ease: "power1.inOut",
        onComplete() {
          popup.setAttribute('aria-hidden', 'true');
          imagesWrapper.innerHTML = '';
          titleEl.textContent = '';
        }
      });
      if (moveListener) {
        window.removeEventListener('mousemove', moveListener);
        moveListener = null;
      }
      current = null;
    }

    // Delegated hover logic
    document.body.addEventListener('mouseenter', (e) => {
      const proj = e.target.closest('.timeline-projects');
      if (!proj) return;
      clearTimeout(showTimeout);
      showTimeout = setTimeout(() => {
        current = proj;
        showPopup(proj, e);
      }, 60);
    }, true);

    document.body.addEventListener('mouseleave', (e) => {
      const proj = e.target.closest('.timeline-projects');
      if (!proj) return;
      if (current === proj) {
        hidePopup();
      }
    }, true);

    document.body.addEventListener('mousemove', (e) => {
      if (!current) return;
      const over = e.target.closest('.timeline-projects');
      if (over !== current) {
        hidePopup();
      }
    });
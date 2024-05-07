const heroNavSpan = document.querySelectorAll('.hero_nav_span');
const heroNav = document.querySelectorAll('.hero_nav_scroll_link');
const anchors = document.querySelectorAll('a[href*="#"]')

const userHeight = window.innerHeight;

window.addEventListener('scroll', e => {
  document.body.style.cssText += `--scrollTop: ${this.scrollY}px`
})


heroNav.forEach((event) => {
  event.addEventListener('click', () => {
    heroNavSpan.forEach((span) => {
      span.classList.remove('hero_nav_span_active');
    });
    event.nextElementSibling.classList.add('hero_nav_span_active');
  });
});


for (let anchor of anchors) {
  anchor.addEventListener('click', function (e) {
    e.preventDefault()

    const blockID = anchor.getAttribute('href').substring(1)

    document.getElementById(blockID).scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  })
}

function onEntry(entry) {
  entry.forEach(change => {
    if (change.isIntersecting) {
      change.target.classList.add('show_animation');
    }
    else {
      // change.target.classList.remove('show_animation');  // для зворотньої анімації
    }
  });
}

let options = {
  threshold: [0.5]
};
let observer = new IntersectionObserver(onEntry, options);
let elements = document.querySelectorAll('.hide_animation');

for (let elm of elements) {
  observer.observe(elm);
}

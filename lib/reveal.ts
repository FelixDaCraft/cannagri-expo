/**
 * Script à placer dans <head> : active les apparitions au défilement seulement si le visiteur
 * accepte les animations et que le navigateur sait observer le défilement. Si le JavaScript
 * de la page ne démarre pas dans les 4 secondes, tout est réaffiché : le contenu n'est jamais
 * bloqué à opacity 0.
 */
export const revealBootScript = `(function(){try{var d=document.documentElement;if(!window.matchMedia||window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;d.setAttribute('data-reveal-on','');setTimeout(function(){if(!window.__revealReady)d.removeAttribute('data-reveal-on')},4000)}catch(e){}})();`

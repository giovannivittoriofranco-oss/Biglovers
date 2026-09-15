function go(url){location.href=url}
function back(){history.length>1?history.back():go('index.html')}
function theme(){return localStorage.getItem('theme')==='dark'}
function applyTheme(){document.documentElement.classList.toggle('dark',theme())}
function toggleTheme(){localStorage.setItem('theme',theme()?'light':'dark');applyTheme();}
applyTheme();

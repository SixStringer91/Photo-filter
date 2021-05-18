const link = 'https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images/'
const body = document.querySelector('html');
const img = document.querySelector('img');
const loader = document.querySelector('.loader-wrapper');
const reset = document.querySelector('.btn-reset');
const upload = document.getElementById('btnInput');
const fullscreenBtn = document.querySelector('.fullscreen');
const download = document.querySelector('.btn-save');
const nextPicture = document.querySelector('.btn-next');
const btnContainer = document.querySelector('.btn-container')
const canvas = document.createElement('canvas');
const picsCount = 20;
const filtersValues = {};

class Editor {
  constructor(dom, img) {
    this.img = img;
    this.input = dom[0];
    this.name = this.input.name;
    this.sizing = this.input.dataset.sizing
    this.result = dom[1];
    this.value = +this.input.value;
    this.defaultValue = this.value;
    this.input.addEventListener('input', e => this.setChanges(e.target.value))
  }
  renderValue = () => {
    this.input.value = this.value;
    this.result.innerHTML = this.value;
    this.img.style.setProperty(`--${this.name}`, `${this.value}${this.sizing}`);
  }
  setChanges = (value) => {
    this.value = value;
    this.renderValue();
  }
  getFilterSettings = () => {
    return `${this.name === 'hue' ? this.name + '-rotate' : this.name}(${this.name === 'blur' ? this.value * 3 : this.value}${this.sizing})`
  }
}

const dayTimeSetter = () => {
  const currentTime = new Date().getHours();
  return currentTime >= 6 && currentTime < 12 ?
    'morning'
    : currentTime >= 12 && currentTime < 18 ?
      'day'
      : currentTime >= 18 && currentTime < 24 ?
        'evening'
        : 'night'
}

const btnContainerHandler = (e) => {
  if(!e.target.classList.contains('btn-active')){
  [].forEach.call(btnContainer.children, el => el.classList.remove('btn-active'));
  e.target.classList.add('btn-active');
  }
  }

const imageLoader = (img) => {
  img.classList.add('invisible');
  loader.classList.remove('invisible')
  img.onload = () =>{
    img.classList.remove('invisible');
    loader.classList.add('invisible')
  }
} 

const picChanger = ((link, img) => {
  let currentPic = 1;
  img.src = `${link}${dayTimeSetter()}/${currentPic.toString().padStart(2, 0)}.jpg`;
  imageLoader(img)

  return (e) => {
    btnContainerHandler(e)
    currentPic = currentPic >= picsCount ? 1 : currentPic + 1;
    img.src = `${link}${dayTimeSetter()}/${currentPic.toString().padStart(2, 0)}.jpg`;
    imageLoader(img);
  }

})(link, img)



const previewFile = (e) => {
  btnContainerHandler(e);
  const file = upload.files[0];
  console.log(upload.files[0])
  const reader = new FileReader();
  reader.onloadend = () => img.src = reader.result;
      imageLoader(img);
  file ? reader.readAsDataURL(file) : preview.src = "";
  upload.type = ''
  upload.type = 'file'
}



const resetFilterSettings = (e) => {
  btnContainerHandler(e)
  for (let key in filtersValues) {
    filtersValues[key].setChanges(filtersValues[key].defaultValue);
  }
}

const drawImage = (src, resolve, filterProps) => {
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = src;
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.filter = filterProps
    ctx.drawImage(img, 0, 0);
    return resolve()
  };
}


const downloadPic = e => {
  btnContainerHandler(e);
  new Promise(resolve => {
    const filterProps = Object.values(filtersValues).map((el) => {
      return el.getFilterSettings()
    }).join('');
    drawImage(img.src, resolve, filterProps);
  }).then(() => {
    const link = document.createElement('a');
    link.download = 'download.png';
    link.href = canvas.toDataURL();
    link.click();
    link.delete;
  });
};


const fullscreenHandler = () => {
  if (fullscreenBtn.classList.contains('openfullscreen')) {
    fullscreenBtn.classList.remove('openfullscreen')
    deactivateFullscreen();
  }
  else {
    fullscreenBtn.classList.add('openfullscreen');
    activateFullscreen(body);
  }
}



const activateFullscreen = (el) => {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  }
  else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  }
  else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  }
  else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  }
};

const deactivateFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
};
const initEditorInterface = (filtersValues) => {
  [].map.call(document.querySelector('.filters')
    .children, (el) => el.children)
    .forEach(el => filtersValues[el[0].name] = new Editor(el, img));
};




const init = () => {
  initEditorInterface(filtersValues);
  reset.addEventListener('click', resetFilterSettings);
  nextPicture.addEventListener('click', picChanger);
  upload.addEventListener('change', previewFile);
  download.addEventListener('click', downloadPic);
  fullscreenBtn.addEventListener('click', fullscreenHandler);

  //btnContainer.addEventListener('click', btnContainerHandler)
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreen && fullscreenBtn.classList.contains('openfullscreen')) fullscreenBtn.classList.remove('openfullscreen');
  });
};

window.addEventListener('load', init);


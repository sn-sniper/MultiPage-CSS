import { getMousePos, getWinSize, isFirefox } from './utils.js';

let mousepos = {x: 0, y: 0};

const updateMousePos = ev => {
    mousepos = getMousePos(ev);
};
  
window.addEventListener('mousemove', updateMousePos);
window.addEventListener('pointermove', updateMousePos, { passive: true });

let winsize = getWinSize();

window.addEventListener('resize', ev => {
    winsize = getWinSize();
});

export class GooCursor {
    DOM = {
        el: null,
        inner: null,
        cells: null,
    };
    cellSize;
    rows;
    columns;
    settings = {
        ttl: 0.2
    };

    constructor(DOM_el) {
        this.DOM.el = DOM_el;

        this.DOM.inner = this.DOM.el.querySelector('.cursor__inner');

        if ( !isFirefox() ) {
            this.DOM.inner.style.filter = 'url(#gooey)';
        }

        this.settings.ttl = this.DOM.el.getAttribute('data-ttl') || this.settings.ttl;
        
        this.layout();

        this.initEvents();
    }

    initEvents() {
        window.addEventListener('resize', () => this.layout());

        const handleMove = () => {
            const cell = this.getCellAtCursor();
          
            if (cell === null || this.cachedCell === cell) return;
            this.cachedCell = cell;
            gsap.set(cell, { opacity: 1 });
            gsap.set(cell, { opacity: 0, delay: this.settings.ttl });
        }

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('pointermove', handleMove, { passive: true });
    }

    layout() {
        this.columns = getComputedStyle(this.DOM.el).getPropertyValue('--columns');
        this.cellSize =  winsize.width/this.columns;
        this.rows = Math.ceil(winsize.height/this.cellSize);
        this.cellsTotal = this.rows * this.columns;
        let innerStr = '';
        this.DOM.inner.innerHTML = '';
        
        const customColorsAttr = this.DOM.el.getAttribute('data-custom-colors');
        let customColorsArr;
        let customColorsTotal = 0;
        if ( customColorsAttr ) {
            customColorsArr = this.DOM.el.getAttribute('data-custom-colors').split(',');
            customColorsTotal = customColorsArr ? customColorsArr.length : 0;
        }
        for (let i = 0; i < this.cellsTotal; ++i) {
            innerStr += customColorsTotal === 0 ?  
                '<div class="cursor__inner-box"></div>' :
                `<div style="transform: scale(${gsap.utils.random(0.5,2)}); background:${customColorsArr[Math.round(gsap.utils.random(0,customColorsTotal-1))]}" class="cursor__inner-box"></div>`;
        }
        this.DOM.inner.innerHTML = innerStr;
        this.DOM.cells = this.DOM.inner.children;
    }

    getCellAtCursor() {
        const columnIndex = Math.floor(mousepos.x / this.cellSize);
        const rowIndex = Math.floor(mousepos.y / this.cellSize);
        const cellIndex = rowIndex * this.columns + columnIndex;

        if ( cellIndex >= this.cellsTotal || cellIndex < 0 ) {
            console.error('Cell index out of bounds');
            return null;
        }

        return this.DOM.cells[cellIndex];
    }
}
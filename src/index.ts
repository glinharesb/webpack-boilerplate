import './index.scss';

declare global {
  interface Window {
    oi: string;
  }
}

const teste: string = 'aquii';

console.log(teste);
console.log(window?.oi);

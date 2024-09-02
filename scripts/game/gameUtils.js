// scripts/game/gameUtils.js

export function getRandomShells(shells) {
    const indexes = [0, 1, 2];
    const i1 = indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0];
    const i2 = indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0];
    return [shells[i1], shells[i2]];
  }
  
  export function swapShellsAndAnimate(shell1, shell2) {
    const rect1 = shell1.getBoundingClientRect();
    const rect2 = shell2.getBoundingClientRect();
  
    const dx = rect2.left - rect1.left;
    const dy = rect2.top - rect1.top;
  
    shell1.style.transition = 'transform 0.5s ease';
    shell2.style.transition = 'transform 0.5s ease';
  
    shell1.style.transform = `translate(${dx}px, ${dy}px)`;
    shell2.style.transform = `translate(${-dx}px, ${-dy}px)`;
  
    setTimeout(() => {
      const temp = document.createElement('div');
      shell1.parentNode.insertBefore(temp, shell1);
      shell2.parentNode.insertBefore(shell1, shell2);
      shell2.parentNode.insertBefore(shell2, temp);
      temp.remove();
  
      shell1.style.transform = '';
      shell2.style.transform = '';
      shell1.style.transition = '';
      shell2.style.transition = '';
  
      if (shell1.contains(document.querySelector('.ball'))) {
        ballIndex = parseInt(shell1.dataset.index, 10);
      } else if (shell2.contains(document.querySelector('.ball'))) {
        ballIndex = parseInt(shell2.dataset.index, 10);
      }
  
      console.log('Current position of the ball is under shell index:', ballIndex);
    }, 500);
  }
  
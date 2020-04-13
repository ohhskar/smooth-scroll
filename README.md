# Smooth Scroll

This repository hosts a snippet that enables smooth scroll on a page by
using transforms. This is heavily based on the code by [osublake](https://codepen.io/osublake/pen/GOJJyr)

## Usage

Import the function and call it with two parameters. The target and the easing.

```
import smoothScroll from './smoothScroll';

window.addEventListener('DOMContentLoaded', () => {
  const currentValues = {
    scrollY: 0,
    target: document.querySelector('.smoothScroll__container'),
  };
  smoothScroll(currentValues, 0.05);
});
```

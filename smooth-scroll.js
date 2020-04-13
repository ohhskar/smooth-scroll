export default (currentValues, ease, maxOffset) => {
  const _ease = ease !== undefined ? ease : 0.1;
  const _maxOffset = maxOffset !== undefined ? maxOffset : 500;
  const _endThreshold = 0.05;
  let _requestId = null;
  const _maxDepth = 20;
  let _viewHeight = 0;
  let _halfViewHeight = 0;
  let _maxDistance = 0;
  let _currentScroll = 0;
  let _resizeRequest = true;
  let _scrollRequest = false;
  let _scrollItems = [];
  let _lastTime = -1;
  const _maxElapsedMS = 100;
  const _targetFPMS = 0.06;

  const _update = (time) => {
    // Setting the deltaTime based on current
    // If time was not passed, get the current time
    const currentTime = time !== undefined ? time : performance.now();
    // Get the elapsed milleseconds between the current time and last known time.
    // If the time difference is greater than the max allowable elapsed time difference
    // the max time difference is used
    const timeDiff = currentTime - _lastTime;
    const elapsedMS = timeDiff > _maxElapsedMS ? _maxElapsedMS : timeDiff;
    const dt = 1 - (1 - _ease) ** (elapsedMS * _targetFPMS);

    // Handle if resized
    const resized = _resizeRequest;
    if (resized) {
      const height = currentValues.target.clientHeight;
      document.body.style.height = `${height}px`;
      _viewHeight = window.innerHeight;
      _halfViewHeight = _viewHeight / 2;
      _maxDistance = _viewHeight * 2;
      _resizeRequest = false;
    }

    // Get current y position
    /* eslint-disable */
    currentValues.scrollY = window.pageYOffset;
    _currentScroll += (currentValues.scrollY - _currentScroll) * dt;
    if (
      Math.abs(currentValues.scrollY - _currentScroll) < _endThreshold ||
      resized
    ) {
      _currentScroll = currentValues.scrollY;
      _scrollRequest = false;
    }
    const scrollOrigin = _currentScroll + _halfViewHeight;
    currentValues.target.style.transform = `translate3d(0, -${_currentScroll}px,0)`;
    /* eslint-enable */

    for (let i = 0; i < _scrollItems.length; i += 1) {
      const item = _scrollItems[i];
      const distance = scrollOrigin - item.top;
      const offsetRatio = distance / _maxDistance;
      item.endOffset = Math.round(_maxOffset * item.depthRatio * offsetRatio);
      if (Math.abs(item.endOffset - item.currentOffset) < _endThreshold) {
        item.currentOffset = item.endOffset;
      } else {
        item.currentOffset += (item.endOffset - item.currentOffset) * dt;
      }
      item.target.style.transform = `translate3d(0px,${item.currentOffset
        * -1}px,0px)`;
    }
    _lastTime = currentTime;
    _requestId = _scrollRequest ? requestAnimationFrame(_update) : null;
  };

  const _onResize = () => {
    // Indicate that a resize was done
    _resizeRequest = true;

    // If no animation frames are playing
    if (!_requestId) {
      // Store current time as last known time
      _lastTime = performance.now();
      // Request animation frame
      _requestId = requestAnimationFrame(_update);
    }
  };

  const _onScroll = () => {
    // Indicate that a scroll was done
    _scrollRequest = true;

    // If no animation frames are playing
    if (!_requestId) {
      // Store current time as last known time
      _lastTime = performance.now();
      // Request animation frame
      _requestId = requestAnimationFrame(_update);
    }
  };

  const _addItems = () => {
    _scrollItems = [];
    const elements = document.querySelectorAll('*[data-depth]');
    for (let i = 0; i < elements.length; i += 1) {
      const element = elements[i];
      const initDepth = element.getAttribute('data-depth');
      /* eslint-disable */
      const depth =
        initDepth > 0
          ? initDepth > 20
            ? 20
            : initDepth
          : initDepth < -20
          ? -20
          : initDepth;
      /* eslint-enable */
      const rect = element.getBoundingClientRect();
      const item = {
        target: element,
        depth,
        top: rect.tp + window.pageYOffset,
        depthRatio: depth / _maxDepth,
        currentOffset: 0,
        endOffset: 0,
      };
      _scrollItems.push(item);
    }
  };

  _addItems();
  window.addEventListener('resize', _onResize);
  window.addEventListener('scroll', _onScroll);
  _update();
};o

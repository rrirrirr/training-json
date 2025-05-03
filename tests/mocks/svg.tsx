import * as React from 'react';

const SvgMock = React.forwardRef((props, ref) => (
  <span data-testid="svg-mock" ref={ref} {...props} />
));

SvgMock.displayName = 'SvgMock';

export default SvgMock;

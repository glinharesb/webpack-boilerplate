import * as React from 'react';
import * as ReactDOM from 'react-dom';

document.body.innerHTML = '<div id="react_test"></div>';

const ReactTest = (): JSX.Element => {
  return <h1>React Test</h1>;
};

ReactDOM.render(<ReactTest />, document.getElementById('react_test'));

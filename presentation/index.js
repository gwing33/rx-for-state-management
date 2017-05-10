
import _ from 'lodash';
import React from 'react';
import { Subject, Observable } from 'rxjs';
import { connectStream } from './connectStream';

// Import Spectacle Core tags
import {
  BlockQuote,
  Cite,
  Deck,
  Heading,
  ListItem,
  List,
  Quote,
  Slide,
  Text,
  CodePane,
  Appear,
} from 'spectacle';

// Import image preloader util
import preloader from 'spectacle/lib/utils/preloader';

// Import theme
import createTheme from 'spectacle/lib/themes/default';

// Require CSS
require('normalize.css');
require('spectacle/lib/themes/default/index.css');

const images = {
  officeSpace: require('../assets/officeSpace.gif'),
  logo: require('../assets/logo.svg'),
  marble: require('../assets/marble.png'),
  humanComputer: require('../assets/humanComputer.png'),
  futuramaFry: require('../assets/futuramaFry.jpg'),
};

preloader(images);

const theme = createTheme(
  {
    primary: 'white',
    secondary: '#1F2022',
    tertiary: '#328BD6',
    quartenary: '#CECECE',
    quinary: '#42505c',
    gray: '#708393',
  },
  {
    primary: 'Josefin Sans',
    secondary: 'Helvetica',
    tertiary: 'Lucida Console',
  }
);

const WhatObservable = connectStream({
  timer: () => Observable.interval(1000).scan((acc, x) => {
    acc.splice(0,1);
    return acc.concat(x);
  }, ['-', '-', '-']),
})(({timer = ['-', '-', '-']}) => {
  return (
    <Appear>
      <div>
        <CodePane textSize="24px" margin="60px 0 0 0" lang="javascript" source={`import { Observable } from 'rxjs';

const stream = Observable.interval(1000);
const subscription = stream.subscribe(x => console.log(x));`} />
        <Text margin="60px 0 0 0" textColor="primary" textFont="tertiary" size={1}>
          {'- '}{timer.map((x, i) => (
            <span key={i} style={{margin: '0 5px'}}>{!!i && ' - '}<i>{x}</i></span>
          ))}{' ->'}
        </Text>
      </div>
    </Appear>
  )
});

const Timer = connectStream({
  timer: () => Observable.interval(1000).startWith(0)
})(({ timer }) => {
  return <Text margin="0 0 100px 0" size={1}>{timer}</Text>;
});

const TimerPlus = connectStream({
  timer: () => {
    const subject = new Subject();

    return subject
      .startWith(0)
      .merge(Observable.interval(1000).map(() => ({ type: 'ADD' })))
      .scan((state, action = {}) => {
        console.log("state, action", state, action);
        switch(action.type) {
          case 'ADD':
            return state + 1;
          case 'SUBTRACT':
            return state - 1;
        }
        return state;
      })
      .map(x => ({
        count: x,
        dispatch: (y) => subject.next(y)
      }));
  }
})(({ timer }) => {
  return (
    <Text margin="0 0 100px 0" size={1}>
      <a style={{cursor: 'pointer', color: '#328BD6'}} onClick={() => timer.dispatch({ type: 'SUBTRACT' })}>-</a>
      {' '}
      <span style={{width: '100px', display: 'inline-block'}}>{timer.count}</span>
      {' '}
      <a style={{cursor: 'pointer', color: '#328BD6'}}  onClick={() => timer.dispatch({ type: 'ADD' })}>+</a>
    </Text>
  );
});


export default class Presentation extends React.Component {
  render() {
    return (
      <Deck transition={['slide']} transitionDuration={500} theme={theme}>
        <Slide transition={['zoom']} bgColor="primary">
          <Heading size={1} fit lineHeight={1} textColor="secondary">
            Observables (RxJS) for State Management
          </Heading>
          <div style={{display: "flex", marginTop: "40px"}}>
            <img height="140" width="140" src={images.logo} />
            <div>
              <Text margin="10px 0 0 20px" textColor="tertiary" textAlign="left">
                Gerald Leenerts
              </Text>
              <Text margin="10px 0 0 20px" textColor="gray" textAlign="left" textSize="30px">
                Front-end Engineer at Follow Up Boss
              </Text>
              <Text margin="10px 0 0 20px" textColor="gray" textAlign="left" textSize="30px">
                gthirty3.com
              </Text>
            </div>
          </div>
        </Slide>
        <Slide transition={['slide']} bgColor="tertiary">
          <div>
            <Text margin="0 0 60px 0" textColor="primary" size={1}>
              An Observable is a <b>Set</b> of events over time.
            </Text>
            <img width='50%' src={images.marble} />
            <WhatObservable />
          </div>
        </Slide>
        <Slide transition={['slide']} bgColor="tertiary">
          <Heading size={4} textColor="primary">
            Benefits of an Observable
          </Heading>

          <List textColor="primary">
            <ListItem margin="10px 0 0 0">Cancelable</ListItem>
            <ListItem margin="10px 0 0 0">Return multiple values, not just one</ListItem>
            <ListItem margin="10px 0 0 0">Compose async (and multiplexed) events</ListItem>
          </List>
        </Slide>
        <Slide transition={['slide']}>
          <Text margin="0 0 100px 0" textColor="tertiary" size={1}>
            Why use <b>Observables</b> with React?
          </Text>
          <img style={{marginRight: '40px'}} width='50%' src={images.humanComputer} />
        </Slide>
        <Slide transition={['slide']} bgColor="tertiary">
          <Text margin="0 0 100px 0" textColor="primary" size={1}>
            <b>Real</b> world example:
          </Text>
          <img src={images.officeSpace} />
        </Slide>
        <Slide transition={['slide']}>
          <CodePane textSize="24px" lang="javascript" source={`const timerStream = Observable
  .internval(1000)
  .startWith(0);

class AppTimer extends React.Component {
  constructor(props) {
    super(props);

    this._subscription = timerStream
      .subscribe(x => this.setState({ timer: x }));
  }
  componentWillUnmount() {
    this._subscription.unsubscribe();
  }
  render() {
    return <div>{this.state.timer}</div>;
  }
}`} />
        </Slide>
        <Slide transition={['slide']}>
          <Text margin="0 0 100px 0" size={1}>
            And we get...
          </Text>
          <Timer />
          <Text textSize="30px">
            (we can do better)
          </Text>
        </Slide>
        <Slide transition={['slide']}>
          <CodePane textSize="24px" lang="javascript" source={`const timerStream = Observable
  .internval(1000)
  .startWith(0);

class Timer extends React.Component {
  static propTypes = {
    timer: PropTypes.object
  };
  render() {
    return <div>{this.props.timer}</div>;
  }
}

const AppTimer = connectStream({
  timer: () => timerStream
})(Timer);`} />
        </Slide>
        <Slide transition={['slide']}>
          <CodePane textSize="24px" lang="javascript" source={`const actions = new Subject();
const timerStore = actions
  .startWith(0)
  .merge(
    Observable.interval(1000).map(() => ({ type: 'ADD' }))
  )
  .scan((state, action = {}) => {
    switch(action.type) {
      case 'ADD':
        return state + 1;
      case 'SUBTRACT':
        return state - 1;
    }
    return state;
  })
  .map(s => ({ count: s, dispatch: x => actions.next(x) }));`} />
        </Slide>
        <Slide transition={['slide']}>
          <CodePane textSize="24px" lang="javascript" source={`class Timer extends React.Component {
  static propTypes = {
    timer: PropTypes.object
  };
  render() {
    const {timer} = this.props;
    return (
      <div>
        <a onClick={() => timer.dispatch({ type: 'SUBTRACT' })}>-</a>
        <span>{timer.count}</span>
        <a onClick={() => timer.dispatch({ type: 'ADD' })}>+</a>
      </div>
    );
  }
}
const TimerPlus = connectStream({
  timer: () => timerStore
})(Timer);`} />
        </Slide>

        <Slide transition={['slide']}>
          <Text margin="0 0 100px 0" size={1}>
            And we get...
          </Text>
          <TimerPlus />
        </Slide>

        <Slide transition={['slide']} bgColor="tertiary">
          <CodePane textSize="24px" lang="javascript" source={`function fetchReport(id) {
  return Observable.fromPromise(
    fetch('/report/' + id)
  );
};

const AppReport = connectStream({
  report: ({id}) => {
    fetchReport(id).merge(
      pusherWebSocket
        .filter(event => event === 'report:' + id)
        .flatMap(() => fetchReport(id))
    );
  }
})(Report);

<AppReport id="1" />`} />
        </Slide>
        <Slide transition={['slide']}>
          <Text margin="0 0 100px 0" size={1}>
            Complications
          </Text>
          <img src={images.futuramaFry} />
        </Slide>
        <Slide transition={['slide']} bgColor="tertiary">
          <Heading size={4} textColor="primary">
            Resources
          </Heading>
          <Text margin="30px 0 0 0" textColor="primary" textAlign="left">
            <b>RxJS v5</b><br /> http://reactivex.io/rxjs
          </Text>
          <Text margin="30px 0 0 0" textColor="primary" textAlign="left">
            <b>Observable Proposal</b><br /> https://github.com/tc39/proposal-observable
          </Text>
          <Text margin="30px 0 0 0" textColor="primary" textAlign="left">
            <b>Redux like RxJS</b><br /> http://rudiyardley.com/redux-single-line-of-code-rxjs/
          </Text>
          <Text margin="30px 0 0 0" textColor="primary" textAlign="left">Many many more...</Text>
        </Slide>
      </Deck>
    );
  }
}

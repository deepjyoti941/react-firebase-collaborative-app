import React from 'react';
import * as API from '../api';
import {markdown} from 'markdown';

export default class Section extends React.Component {

  constructor(props) {
      // super constructor as this component extends other class React.Component
      super(props);
      this.state = this.getState(props);
  }

  // custom function to get the state of component
  getState = props => ({
    content: props.section.content,
    html: props.section.content ? markdown.toHTML(props.section.content) : ''
  })

  render() {

    let content = <span dangerouslySetInnerHTML={ {__html: this.state.html} }/>

    let classes = ['row', 'section'];

    return <section className={ classes.join(' ')}>
      {content}
    </section>
  }
}

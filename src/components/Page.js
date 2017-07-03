import React from 'react';
import * as API from '../api';

export default class Page extends React.Component {
  state = {
    page: {}
  }

  componentDidMount() {
    API.pages.child(this.props.params.id).on('value', this.updateContent);
  }

  /*** switching next one page to another functionality start ***/
  // when route changes react router will use PageList component that already we have and instead of rerendering whole page i will just
  // pass new parameters i.e updating the props of the component
  componentWillReceiveProps(nextProps) {
    // stop listening for value event on page we are rendering and start listening the value event on page we are about to render
    API.pages.child(this.props.params.id).off('value', this.updateContent);
    API.pages.child(nextProps.params.id).on('value', this.updateContent);
  }
  /*** switching next one page to another functionality end ***/

  updateContent = (snapshot) => {
    let json = snapshot.exportVal();
    this.setState({
      page: json,
      sections: json.sections
    })
  }

  render() {
    let sections = [];

    if (this.state.page.title) {
      // render the page sections
      if(this.props.user)
        sections.push(<p key='addSection'>
          <button onClick={this.addSection}>Add Section</button>
        </p>)
    }
    return <article>
      <h1> {this.state.page.title || 'Loading...'} </h1>
      {sections}
    </article>
  }


  addSection = evt => {
    let id;
    if (!this.state.sections) {
      id = 1;
      this.state.sections = {};
    } else {
      id = Math.max(...Object.keys(this.state.sections)) + 1;
    }

    this.state.sections[id] = {
      editor: this.props.user.username
    }

    this.setState({
      sections: this.state.sections
    });
  }


}

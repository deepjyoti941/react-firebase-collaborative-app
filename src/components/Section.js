import React from 'react';
import * as API from '../api';
import {markdown} from 'markdown';

export default class Section extends React.Component {

  /**
   * [super constructor as this component extends other class React.Component]
   * @param  {[type]} props   [props when the Section component is rendered]
   * @param  {[type]} context [context passed from other class @here router context is passed to section component]
   * @return {[type]}         [description]
   */
  constructor(props, context) {
      super(props, context);
      this.context = context;
      this.state = this.getState(props);
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  /**
   * [componentWillReceiveProps when component receive new properties]
   * [render the html section as soon as the state is change i.e it goes to state with new values]
   * @param  {[type]} nextProps [description]
   * @return {[type]}           [description]
   */
  componentWillReceiveProps(nextProps) {
    var state = this.getState(nextProps);

    this.makeInternalLinks(state.html, html => {
      state.html = html;
      this.setState(state);
    });

  }

  /**
   * [componentDidUpdate this react function calls everytime when properties or state updates]
   * @param  {[type]} prevProps [description]
   * @param  {[type]} prevSate  [description]
   * @return {[type]}           [description]
   */
  componentDidUpdate(prevProps, prevSate) {
    if(this.state.editing) React.findDOMNode(this.refs.editor).focus();
  }

  // custom function to get the state of component
  getState = props => ({
    locked: props.user && props.section.editor && props.user.username !== props.section.editor,
    editing: props.user && props.user.username === props.section.editor,
    content: props.section.content,
    html: props.section.content ? markdown.toHTML(props.section.content) : ''
  })

  render() {

    let content;

    if (this.state.editing) {
      content = <textarea ref='editor' className='twelve columns' defaultValue={this.state.content}
        onChange={this.updateContent} onBlur={this.save} />;
    } else {
      content = <span dangerouslySetInnerHTML={ {__html: this.state.html} }/>
    }
    let classes = ['row', 'section'];

    if(this.state.editing) classes.push('editing');
    if(this.props.user) classes.push( this.state.locked ? 'locked' : 'editable');

    return <section onClick={this.startEditing} className={ classes.join(' ')}>
      {content}
    </section>
  }

  updateContent = evt => this.setState({ content: evt.target.value });

  save = evt => {
    this.setState({ editing: false });
    API.pages.child(this.props.path).update({
      editor: null,
      content: this.state.content || null
    })
  }

  startEditing = evt => {
    // check if user click on anchor link
    if (evt.target.tagName === 'A') {
      var href = evt.target.getAttribute('href');
      // var href = evt.target.pathname;

      // check if local or external link
      if(href.indexOf('/page/') === 0) {
        evt.preventDefault();
        this.context.router.transitionTo(href);
      }
      return;
    }


    if(!this.props.user || this.state.editing || this.state.locked) return; // if one user is editing the section other user will see it locked
    this.setState({ editing: true });
    API.pages.child(this.props.path).update({
      editor: this.props.user.username
    })
  }

  /**
   * [ function to create inter links of type [[Dogs]] ]
   * @type {[type]}
   */
  makeInternalLinks(html, callback) {
      // regular exp which matches two opening sq brackets and capture the string between them and then match two closing sq brackets
      const anchor = /\[\[(.*)\]\]/g;

      API.pages.once('value', snapshot => {
        let pages = snapshot.exportVal();
        let keys = Object.keys(pages);

        callback(html.replace(anchor, (match, anchorText) => {
            for (let key of keys)
              if(pages[key].title === anchorText.trim())
                return `<a href="/page/${key}">${anchorText}</a>`
        }));

      });
  }
}

/**
 * [ Passing Data Across Components with Contexts (childContextTypes, getChildContext(), contextTypes)
 * Reference: http://codetheory.in/passing-data-across-components-with-contexts-in-reactjs/
 * @here passing router context to Section component to handle inter link click so that no full page refresh]
 * @type {Object}
 */
Section.contextTypes = {
  router: React.PropTypes.func.isRequired
}

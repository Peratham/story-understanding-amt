// Parameters
var stopWordList = "a about above across after again against almost alone along already also although always an and another any as ask asked asking asks at away b back backed backing backs be became because become becomes been before began behind being beings best better between big both but by c came can cannot case cases certain certainly clear clearly come could d did differ different differently do does done down down downed downing downs during e each early either end ended ending ends enough even evenly ever f face faces fact facts far felt few find finds for four full fully further furthered furthering furthers g gave general generally get gets give given gives go going good goods got great greater greatest group h had has have having here herself high high high higher highest how however if important in interest interested interesting interests into is it its itself j just k keep keeps kind knew know known knows l large largely last later latest least less let lets like likely long longer longest m made make making might more most mostly mr mrs much must n necessary need needed needing needs never new new newer newest next not now number numbers o of off often old older oldest on only open opened opening opens or order ordered ordering orders other others our out over p part parted parting parts per perhaps place places point pointed pointing points possible present presented presenting presents put puts q quite r rather really right right room rooms s said same saw say says second seconds see seem seemed seeming seems sees several shall should show showed showing shows side sides since small smaller smallest so some states still still such sure t take taken than that the then there therefore think thinks though thought thoughts three through thus to today too took toward turn turned turning turns two u under until up upon use used uses v very w want wanted wanting wants was way ways well wells went were what when where whether which while who whole whose why will with within without work worked working works would x y year years yet you young younger youngest z";
var defaultObjects = ["someone", "something", "somewhere"];

var FooterInstructionComponent = window.FooterInstructionComponent;
ReactDOM.render(<FooterInstructionComponent step={1} substep={1} r={1}/>, document.getElementById('footer-instructions'));

var InstructionComponent = window.InstructionComponent;
ReactDOM.render(<InstructionComponent />, document.getElementById('instruction-div'));

var SubHeaderInstructionComponent = window.SubHeaderInstructionComponent;

/*
React component containing rendered consequence
*/
var ConsequenceComponent = React.createClass({ // fix 20 index button linking
  getInitialState: function() {
    return { linking: false, // are we currently linking?
             linkList: [],   // words
             i:-1,           // temporary index of linked word
             colors:{}       // array of color links
            }
  },

  setLink: function() { // i, j, grounding jth word of ith action
    if(this.props.alreadyLinking == false) {
      this.setState({linking: true});
      this.setState({linkList: this.props.cons.trim().split(" ")});
      $('#story').removeClass('noselect');
      $('#story-ending').removeClass('noselect');
      $('#story-ending2').removeClass('noselect');
      this.props.toggleLink();
    }
  },
  
  link: function(i) {
    var word = this.state.linkList[i];
    this.refs.linked_element.value = word;
    this.setState({i: i});
  },

  saveLink: function() {
    var color = new RColor;
    var c = color.get(true);
    var cols = this.state.colors;
    cols[this.state.i] = c;
    this.setState({colors: cols});
    if(this.props.selectedText == "") {
      alert('You have not selected anything from the context to ground to. It is recommended that you reground this word.');
    }
    this.props.addLink(20, this.state.i, this.props.selectedText,c);
    $('#story').addClass('noselect');
    $('#story-ending').addClass('noselect');
    this.setState({linking: false});
    this.props.toggleLink();
  },
  
  render: function() {
    var btnStyle = { marginLeft: 5, marginRight: 0 };
    var groundBtnStyle = { marginLeft: 5, marginRight: 0 };
    var wrapStyle = { display: 'inline-block' };
    var linkedElementStyle = { display: 'inline-block', width: 50, overflow:'hidden', marginBottom:-8, marginLeft:5 };
    var divStyle = { display: 'inline-block', margin: 5, marginBottom: -5 };
    var linkStyle = {marginTop: 40, textAlign: 'center' };
    var s = this.props.step;
    
    // Display grounding button depending if there exists an action we are currently linking
    if(s==1 || this.props.alreadyLinking == true || this.props.linkToggle == true) {
      groundBtnStyle['display'] = 'none';
    } else {
      groundBtnStyle['display'] = '';
    }
    
    // if the step is 2, display the grounding buttons and remove the rule manipulation buttons
    if(this.state.linking == true && this.props.step == 2){
      return (
        <div style = {wrapStyle}>
          <div style={linkStyle}>
            <textarea ref='linked_element' rows="1" maxLength="50" placeholder="Linked Element" style={linkedElementStyle} disabled></textarea>
            <span> ==></span>
            <textarea ref='ground' rows="1" maxLength="50" placeholder="Context" value={this.props.selectedText} style={linkedElementStyle} disabled></textarea>
            <button onClick={this.saveLink} className='btn btn-xs link-btn btn-success' style={btnStyle}>submit</button>
          </div>
          <div className="actionText" style={divStyle}>
          {
            this.state.linkList.map(function(word, i) {
              if (stopWordList.includes(word)) {
                return(" " + word + " ");
              } else {
                return (
                  <button key={i} onClick={() => {this.link(i)}} className='btn btn-xs link-btn' style={btnStyle}>{word}</button>
                );
              }
            },this)
          }
          </div>
        </div>
        );
    } else {
      return(
        <div style = {wrapStyle}>
          <div style={linkStyle}>
            <button onClick={this.setLink} className='btn btn-xs link-btn' style={groundBtnStyle}>Ground to Context</button>
          </div>
            <div ref='consequenceText' className='consequenceText' style={divStyle}>{
              this.props.cons.split(" ").map(function(word, i) {
                var colStyle = {color: this.state.colors[i]}
                return(<span key={i} style={colStyle}>{word} </span>);
              },this)
            }
            </div>
        </div>
      );
    }
  }
});

/*
React premise component
*/
var PremiseComponent = React.createClass({
  getInitialState: function() {
    var customVal = false;
    if(this.props.predicateIndex == 0) {
      customVal = true;
    } else { customVal = false }
    return { op: this.props.opdefaultValue, // default operator value for this premise
             act: this.props.adefaultValue, // default predicate value for this premise
             customValue: customVal,        // does the worker want to write his own premise?
             customCustomValue: false,
             linking: false,                // are we linking this premise?
             linkList: [],                  // list of words
             i:-1,                          // index for linked word
             colors: []                     // set of colors for linked words
            }
  },
  getAction: function() {
    if(this.state.customValue == true){
      var actionSubject = this.refs.actionSubject.value;
      var actionPredicate = this.refs.actionPredicate.value;
      var actionObject = this.refs.actionObject.value;
      return(actionSubject + " " + actionPredicate + " " + actionObject);
    } else {
      return(this.state.act);
    }
  },

  getOp: function() {
    if(this.state.op == '' || this.state.op == null) {return("and");}
    return(this.state.op);
  },

  opChangeHandler: function(event){
    this.setState({op: event.target.value});
  },

  onBlurHandler: function(event) {
    if(event.target.value == '') {
      this.setState({customValue: false});
    }
  },

  actChangeHandler: function(event){
    if(event.target.value == 'customOption') {
      this.setState({customValue: true});
    } else {
      this.setState({act: event.target.value});
    }
  },

  setLink: function() { // i, j, grounding jth word of ith action
    if(this.props.alreadyLinking == false) {
      this.setState({linking: true});
      var action = this.getAction();
      this.setState({linkList: action.trim().split(" ")});
      $('#story').removeClass('noselect');
      $('#story-ending').removeClass('noselect');
      $('#story-ending2').removeClass('noselect');
      this.props.toggleLink();
    }
  },

  link: function(i) {
    this.setState({i: i});
    var word = this.state.linkList[i];
    ReactDOM.render(<FooterInstructionComponent step={2} substep={1} r={2} />, document.getElementById('footer-instructions'));
    this.refs.linked_element.value= word;
  },
  contextChange: function() {
    ReactDOM.render(<FooterInstructionComponent step={2} substep={1} r={4} />, document.getElementById('footer-instructions'));
  },
  
  saveLink: function() {
    var color = new RColor;
    var c = color.get(true);
    var cols = this.state.colors;
    cols[this.state.i] = c;
    this.setState({colors: cols});
    if(this.props.selectedText == "") {
      alert('You have not selected anything from the context to ground to. It is recommended that you reground this word.');
    }
    this.props.addLink(this.props.index, this.state.i, this.props.selectedText,c);
    $('#story').addClass('noselect');
    $('#story-ending').addClass('noselect');
    $('#story-ending2').addClass('noselect');
    ReactDOM.render(<FooterInstructionComponent step={2} substep={1} r={5} />, document.getElementById('footer-instructions'));
    this.setState({linking: false});
    this.props.toggleLink();
  },
  
  removePremise: function() {
    this.props.removePremise(this.props.index);
  },
  /*
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.adefaultValue != this.props.adefaultValue) {
      console.log('tst1');
      this.refs.actionPredicate.value = nextProps.adefaultValue.split(" ").slice(1, -1).join(" "); // fix later
      console.log('tst2');
    }
  },
  */
  subjectChange: function() {
    ReactDOM.render(<FooterInstructionComponent step={1} substep={1} r={2} />, document.getElementById('footer-instructions'));
  },
  objectChange: function() {
    ReactDOM.render(<FooterInstructionComponent step={1} substep={1} r={3} />, document.getElementById('footer-instructions'));
  },
  predicateChange: function() {
    ReactDOM.render(<FooterInstructionComponent step={1} substep={1} r={4} />, document.getElementById('footer-instructions'));
  },

  render: function() {
    var btnStyle = { marginLeft: 5, marginRight: 0 };
    var objectStyle = {marginRight:5}; //marginRight: 5
    var groundBtnStyle = { marginLeft: 5, marginRight: 0};
    var wrapStyle = { display: 'inline-block', marginBottom: 15};
    var linkedElementStyle = { display: 'inline-block', width: 50, overflow:'hidden', marginBottom:-8, marginLeft:5 };
    var divStyle = { display: 'inline-block', margin: 5, marginBottom: -5 };
    var linkStyle = { marginTop: -25, textAlign: 'center' };
    var formStyle = { width:120, marginRight: 50 };
    var removePremiseStyle = {marginTop: -20};
    var selectStyle = {}
    
    if(this.props.index == this.props.numActions-1) {selectStyle = {display: 'none'};} else {selectStyle={};}
    if(this.props.numActions == 1) {removePremiseStyle={display: 'none'}}else {removePremiseStyle={};}

    var s = this.props.step;
    if(s==1 || this.props.alreadyLinking == true || this.props.linkToggle == true) {
      groundBtnStyle['display'] = 'none';
    } else {
      groundBtnStyle['display'] = '';
    }
    
    var actionSubjectDefault = this.props.adefaultValue.split(" ")[0];
    var actionPredicateDefault = this.props.adefaultValue.split(" ").slice(1, -1).join(" ");
    var actionObjectDefault = this.props.adefaultValue.split(" ").slice(-1)[0];

    if(this.props.edit == true) {
      if (this.state.customValue == true || this.props.predicateIndex == 0) { // no options to chose from
      return(
          <div style={wrapStyle}>
            <div style={linkStyle}>
              <button onClick={this.removePremise} style={removePremiseStyle} className='btn btn-xs save-predicate-btn'>Remove Premise</button>
            </div>
            
            <span style = {wrapStyle}>
              <select className='soflow' ref='actionSubject' defaultValue={actionSubjectDefault} onChange={this.subjectChange} style={btnStyle}>
                <option value="" disabled>subject</option>
                <option value="someone">someone</option>
                <option value="something">something</option>
                <option value="somewhere">somewhere</option>
              </select>
              
              <textarea ref='actionPredicate' rows="1" maxLength="50" cols="10" placeholder="action" defaultValue={actionPredicateDefault} onChange={this.predicateChange} style={divStyle} onBlur={this.onBlurHandler}></textarea>
              
              <select className='soflow' ref='actionObject' defaultValue={actionObjectDefault} onChange={this.objectChange} style={objectStyle}>
                <option value="" disabled>object</option>
                <option value="someone">someone</option>
                <option value="something">something</option>
                <option value="somewhere">somewhere</option>
              </select>
              
              <select className='soflow' ref='op' style={selectStyle} defaultValue={this.props.opdefaultValue} onChange={this.opChangeHandler}>
                <option value="and">and</option>
                <option value="or">or</option>
              </select>
            </span>
          </div>
          );
      } else { // not custom value
        return (
          <div style={wrapStyle}>
          <div style={linkStyle}>
            <button onClick={this.removePremise} style={removePremiseStyle} className='btn btn-xs save-predicate-btn'>Remove Premise</button>
          </div>
          <div style={wrapStyle}>
            <select ref='action' style={divStyle} onChange={this.actChangeHandler}>
                <option selected="selected" defaultValue={this.state.act} disabled>premise</option>
                {
                this.props.consList.map(function(consequence) {
                  return(<option key={consequence}
                    value={consequence}>{consequence}</option>);
                })
              }
              <option value="customOption">[custom premise]</option>
            </select>
            <select ref='op' style={selectStyle} defaultValue={this.props.opdefaultValue} onChange={this.opChangeHandler}>
              <option value="and">and</option>
              <option value="or">or</option>
            </select>
          </div>
          </div>
          );
      }
    } else {
      if(this.state.linking == true  && this.props.step == 2){
        return(
          <div style = {wrapStyle}>
            <div style={linkStyle}>
              <textarea ref='linked_element' rows="1" maxLength="50" placeholder="Linked Element" style={linkedElementStyle} disabled></textarea>
              <span> ==></span>
              <textarea ref='ground' rows="1" maxLength="50" placeholder="Context" value={this.props.selectedText} style={linkedElementStyle} onChange={this.contextChange} disabled></textarea>
              <button onClick={this.saveLink} className='btn btn-xs link-btn btn-success' style={btnStyle}>submit</button>
            </div>
            <div className="actionText" style={divStyle}>
            {
              this.state.linkList.map(function(word, i) {
                if (stopWordList.includes(word)) {
                  return(" " + word + " ");
                } else {
                  return (
                    <button key={i} onClick={() => {this.link(i)}} className='btn btn-xs link-btn' style={btnStyle}>{word}</button>
                  );
                }
              },this)
            }
            </div>
            <div style={wrapStyle}>
              <b style={selectStyle}>{this.props.opdefaultValue}</b>
            </div>
          </div>
          );
      }
      else {
        return(
          <div style = {wrapStyle}>
            <div style={linkStyle}>
              <button ref="linkBtn" onClick={this.setLink} className='btn btn-xs link-btn' style={groundBtnStyle}>Ground to Context</button>
            </div>
            <div style = {wrapStyle}>
              <div className="actionText" style={divStyle}>
              {
                this.props.adefaultValue.split(" ").map(function(word, i) {
                  var colStyle = {color: this.state.colors[i]}
                  return(<span key={i} style={colStyle}>{word} </span>);
                },this)
              }
              </div>
              <b style={selectStyle}>{this.props.opdefaultValue}</b>
            </div>
          </div>
        );
      }
    }
  }
});

/*
React component for rule
*/
var RuleComponent = React.createClass({
  getInitialState: function() {
    return { editing: true, actions: [], ops:[], linking: false }
  },

  edit: function() {
    this.props.toggleEdit();
    ReactDOM.render(<FooterInstructionComponent step={1} substep={1} r={-1}/>, document.getElementById('footer-instructions'));
    this.setState({editing: true});
  },

  remove: function() {
    if (this.props.numPreds > 1) {
      console.log('removing predicate');
      this.props.removePredicate(this.props.index);
    } else {
      alert("Must provide at least one implication.");
      return false;
    }
  },

  save: function() {
    console.log("saving predicate");
    var actions = [];
    var ops = [];
    for(var ref in this.refs) {
      if(ref.includes('action')) {
        actions.push(this.refs[ref].getAction());
        ops.push(this.refs[ref].getOp());
      }
    }
    var consequencePredicate = this.refs.consequencePredicate.value.trim();
    var consequenceSubject = this.refs.consequenceSubject.value.trim();
    var consequenceObject = this.refs.consequenceObject.value.trim();
    console.log(defaultObjects.indexOf(consequenceObject))
    if(this.props.index > 0 && consequencePredicate=="" && consequenceSubject=="" && consequenceObject=="" && actions.join().trim() == "") { // discard empty inference rules
      this.props.toggleEdit();
      this.setState({editing: false});
      this.remove();
      return false;
    }
    for (var i=0;i<actions.length;i++) {
      var aContent = actions[i].split(" ");
      var aLen = aContent.length-1;
      if(aContent.length < 3 || defaultObjects.indexOf(aContent[0]) == -1 || defaultObjects.indexOf(consequenceSubject) == -1 || defaultObjects.indexOf(aContent[aLen]) == -1 || defaultObjects.indexOf(consequenceObject) == -1 || consequencePredicate == "") { // partially complete form
        alert("Can't leave empty fields in premise");
        return false;
      }
    }
    this.props.toggleEdit();
    this.props.updatePredicate(actions, ops, consequenceSubject + " " + consequencePredicate + " " + consequenceObject, this.props.index);
    ReactDOM.render(<FooterInstructionComponent step={1} substep={1} r={7} />, document.getElementById('footer-instructions'));
    this.setState({editing: false});
  },

  addPremise: function() {
    console.log("adding premise");
    var actions = this.state.actions;
    actions.push("");
    ReactDOM.render(<FooterInstructionComponent step={1} substep={1} r={2} />, document.getElementById('footer-instructions'));
    this.setState({actions: actions});
    this.props.addPremise(this.props.index);
  },
  
  removePremise: function(i) { // ith premise
    console.log("removing premise");
    this.props.removePremise(this.props.index,i);
  },

  addLink: function(i, j, grounding,c) { // jth word of ith action and color
    this.props.addLink(this.props.index, i, j, grounding, c);
  },
  
  add: function() {
    console.log('adding predicate');
    if(this.props.cons == null || this.props.cons == ''){alert("Please complete elements of this rule."); return(false);}
    this.props.addPredicate();
    this.setState({editing: false});
  },
  
  setLink: function() {
    var l = this.state.linking
    this.setState({linking: !l});
    ReactDOM.render(<FooterInstructionComponent step={2} substep={1} r={1} />, document.getElementById('footer-instructions'));
    this.props.linkToggler();
  },

  renderNormal: function() {
    var btnVisibility = "";
    if(this.props.index==this.props.numPreds-1) {
      btnVisibility="inline-block";
    } else {
      btnVisibility="none";
    }
    var divStyle = { display: 'inline-block', margin: 5 };
    var btnStyle = { display: btnVisibility, margin: 5};
    var font = { fontSize: 50}

    if(this.props.step==2) {
      return (
        <div className='predicate'>
        <div><b>{'Inference rule ' + (this.props.index+1) + ':'}</b></div>
        <div className='premise-container' style={divStyle}>
        {
          this.props.act.map(function(action, i) {
            return (
              <PremiseComponent
              key={i}
              index={i}
              numActions={this.props.act.length}
              adefaultValue={action}
              opdefaultValue={this.props.op[i]}
              edit={this.state.editing}
              ref={'action'+i}
              addLink={this.addLink}
              contextLinks={this.props.contextLinks[i]}
              selectedText={this.props.selectedText}
              step={this.props.step}
              toggleLink={this.setLink}
              alreadyLinking={this.state.linking}
              linkToggle = {this.props.linkToggle}>
              </PremiseComponent>
              );
          }, this)
        }
        </div>
        <b>implies</b>
        <ConsequenceComponent
          cons={this.props.cons}
          step={this.props.step}
          addLink={this.addLink}
          selectedText={this.props.selectedText}
          contextLinks={this.props.contextLinks[20]}
          toggleLink={this.setLink}
          alreadyLinking={this.state.linking}
          linkToggle = {this.props.linkToggle}>
        </ConsequenceComponent>
        <hr></hr>
        </div>
      );
    } else {
      if(this.props.edit == true) {
        return (
          <div className='predicate'>
          <div><b>{'Inference rule ' + (this.props.index+1) + ':'}</b></div>
          <div className='premise-container' style={divStyle}>
          {
            this.props.act.map(function(action, i) {
              return (
                <PremiseComponent
                key={i}
                index={i}
                numActions={this.props.act.length}
                adefaultValue={action}
                opdefaultValue={this.props.op[i]}
                edit={this.state.editing}
                ref={'action'+i}
                addLink={this.addLink}
                contextLinks={this.props.contextLinks[i]}
                selectedText={this.props.selectedText}
                step={this.props.step}>
                </PremiseComponent>
                );
            }, this)
          }
          </div>
          <b>implies</b>
          <ConsequenceComponent cons={this.props.cons} step={this.props.step} addLink={this.addLink} selectedText={this.props.selectedText} contextLinks={this.props.contextLinks[20]}></ConsequenceComponent>
          <hr></hr>
          </div>
          );
      } else {
        return (
          <div className='predicate'>
          <div><b>{'Inference rule ' + (this.props.index+1) + ':'}</b></div>
          <div className='premise-container' style={divStyle}>
          {
            this.props.act.map(function(action, i) {
              return (
                <PremiseComponent
                key={i}
                index={i}
                numActions={this.props.act.length}
                adefaultValue={action}
                opdefaultValue={this.props.op[i]}
                edit={this.state.editing}
                ref={'action'+i}
                addLink={this.addLink}
                contextLinks={this.props.contextLinks[i]}
                selectedText={this.props.selectedText}
                step={this.props.step}>
                </PremiseComponent>
                );
            }, this)
          }
          </div>
          <b>implies</b>
          <ConsequenceComponent cons={this.props.cons} step={this.props.step} addLink={this.addLink} selectedText={this.props.selectedText} contextLinks={this.props.contextLinks[20]}></ConsequenceComponent>
          <button onClick={this.edit} className='btn btn-xs edit-predicate-btn' style={divStyle}>Edit Rule</button>
          <button onClick={this.remove} className='btn btn-xs remove-predicate-btn' style={divStyle}>Remove Rule</button>
          <button ref='addBtn' onClick={this.add} className='btn btn-xs add-predicate-btn' style={btnStyle}>Add Rule</button>
          <hr></hr>
          </div>
          );
        }
      }
  },

  renderForm: function() {
    var divStyle = { display: 'inline-block', margin: 5, marginBottom: -5 };
    var inlineBlock = { marginLeft:10 };
    var btnStyle = { display: 'inline-block', marginLeft: 5, marginRight:-10 };
    var wrapStyle = { display: 'inline-block' };
    
    var consequenceSubjectDefault = this.props.cons.split(" ")[0];
    var consequencePredicateDefault = this.props.cons.split(" ").slice(1, -1).join(" ");
    var consequenceObjectDefault = this.props.cons.split(" ").slice(-1)[0];

    return (
      <div className='predicate'>
        <div><b>{'Inference rule ' + (this.props.index+1) + ':'}</b></div>
        <button onClick={this.addPremise} className='btn btn-xs add-variable-btn' style={btnStyle}>Add Premise</button>
        <span className='premise-container' style={inlineBlock}>
        {
          this.props.act.map(function(action, i) {
            return (
              <PremiseComponent
              key={i}
              index={i}
              predicateIndex={this.props.index}
              consList={this.props.consList}
              numActions={this.props.act.length}
              adefaultValue={action}
              opdefaultValue={this.props.op[i]}
              edit={this.state.editing}
              ref={'action'+i}
              addLink={this.addLink}
              contextLinks={this.props.contextLinks[i]}
              selectedText={this.props.selectedText}
              step={this.props.step}
              removePremise={this.removePremise}>
              </PremiseComponent>
              );
          }, this)
        }
        </span>
        <span><b>implies&nbsp;&nbsp;</b></span>
        <span className='consequence-container' style={inlineBlock}>
        <select className='soflow' ref='consequenceSubject' defaultValue={consequenceSubjectDefault} onChange={this.subjectChange}>
          <option value="" disabled>subject</option>
          <option value="someone">someone</option>
          <option value="something">something</option>
          <option value="somewhere">somewhere</option>
        </select>
        
        <textarea ref='consequencePredicate' rows="1" maxLength="50" cols="10" placeholder="consequence" defaultValue={consequencePredicateDefault} style={divStyle}></textarea>
        
        <select className='soflow' ref='consequenceObject' defaultValue={consequenceObjectDefault} onChange={this.objectChange}>
          <option value="" disabled>object</option>
          <option value="someone">someone</option>
          <option value="something">something</option>
          <option value="somewhere">somewhere</option>
        </select>
        </span>
        <button onClick={this.save} className='btn btn-xs save-predicate-btn' style={inlineBlock}>Save Rule</button>
        <hr></hr>
      </div>
    );
  },

  render: function() {
    if(this.state.editing) {
      return this.renderForm();
    } else {
      return this.renderNormal();
    }
  }
});

var PredicateManager = React.createClass({
  getInitialState: function() { // predicate 1
    var predicates = [  // overall state of the hit
                        [ // predicates
                          [""],[""], "", [[],[]] // action list, op list, consequence, list of groundings- per word
                        ]
                      ];
    predicates[0][3][20] = [""];
    return {
      predicates: predicates,
      consList: [],           // consequence list
      story: [document.getElementById("story").value,"",""], // story, ending
      linkToggle: false,      // toggle depending on link state
      step: 0,                // hit step
      edit: true,             // are we editing a rule?
      stepBtn: true
    }
  },

  removePredicate: function (i) {
    console.log('removing rule ' + i);
    var predicates = this.state.predicates;
    predicates.splice(i, 1);
    var consequences = this.state.consList;
    consequences.splice(i,1);
    this.setState({consList: consequences});
    this.setState({predicates: predicates});
  },

  updatePredicate: function(actions,ops,consequence,i) { // predicate is a tuple of array of variables and an implication jth action, ith consequence
    console.log('updating comment ' + i);
    var predicates = this.state.predicates;
    var consequences = this.state.consList;
    predicates[i][0] = actions;
    predicates[i][1] = ops;
    predicates[i][2] = consequence;
    consequences[i] = consequence;
    this.setState({predicates: predicates});
    this.setState({consList: consequences});
    globalState[this.props.index] = this.state.predicates;
  },

  addPredicate: function() {
    var predicates = this.state.predicates;
    predicates.push([[""],[""],"",[[],[]]]);
    predicates[predicates.length-1][3][20] = [""];
    this.toggleEdit();
    this.setState({predicates: predicates});
  },

  addPremise: function(i) {
    console.log('adding premise');
    var predicates = this.state.predicates;
    predicates[i][0].push("");
    predicates[i][1].push("");
    predicates[i][3].push([[]]);
    predicates[i][3][predicates[i][3].length-20] = [""]; // TODO: fix
    ReactDOM.render(<FooterInstructionComponent step={1} substep={1} r={1} />, document.getElementById('footer-instructions'));
    this.setState({predicates:predicates});
  },
  
  removePremise: function(i, j) { // ith rule, jth premise
    console.log('removing premise: ' + i);
    var predicates = this.state.predicates;

    if (predicates[i][0].length == 1) {
      alert('Rule requires at least one premise.');
      return(1);
    }
    predicates[i][0].splice(j, 1);
    predicates[i][1].splice(j, 1);
    predicates[i][3].splice(j, 1);
    predicates[i][3].splice(j, 1);
    
    this.setState({predicates:predicates});
  },

  addLink: function(i,j,k, grounding ,c) { // ground kth word of the jth action of the ith rule and color
    console.log('grounding element');
    var predicates = this.state.predicates;
    predicates[i][3][j][k] = [grounding,c]; // error here
    this.setState({predicates: predicates});
    ReactDOM.render(<ContextBoard predicates={predicates}></ContextBoard>, document.getElementById('grounding-container'));
  },
  
  toggleLink: function() {
    var l = this.state.linkToggle;
    this.setState({linkToggle: !l});
  },
  
  toggleEdit: function() {
    var ed = this.state.edit;
    ed = !ed;
    this.setState({edit: ed});
  },

  nextStep: function() {
    console.log('next step');
    $('#submit-btn').prop('disabled', false);
    var s = this.state.step;
    if(s == 0) {
      if(this.state.story[1] == "") {
        alert('Please select an ending from the two provided.');
        return(1);
      }
      s = s+1;
    } else if (s == 1) {
      if(this.state.consList.length < 1) {
        alert('Please create one rule before continuing.');
        return(1);
      } else {
        if(this.state.edit == true) {
          alert('please finish editing all rules before continuing.');
          return(1);
        }
      }
      s = s+1;
      if(s > 1) {
        document.getElementById('context-title').style.display="inline-block";
        document.getElementById('grounding-container').style.display="inline-block";
        //this.setState({stepBtn:!this.state.stepBtn});
      }
    }
    this.setState({step: s});
    ReactDOM.render(<FooterInstructionComponent step={2} substep={1} r={0} />, document.getElementById('footer-instructions'));
  },

  prevStep: function() {
    console.log('prev step');
    var s = this.state.step;
    if (s > 0) {
      s = s-1;
    }
    if (s < 2) {
      document.getElementById('context-title').style.display="none";
      document.getElementById('grounding-container').style.display="none";
      //this.setState({stepBtn:!this.state.stepBtn});
    }
    this.setState({step: s});
    ReactDOM.render(<FooterInstructionComponent step={1} substep={1} r={1} />, document.getElementById('footer-instructions'));
  },
  
  e1Click: function() {
    this.refs.e1.disabled = true;
    this.refs.e2.disabled = false;
    var e = document.getElementById("story-ending").value;
    var s = this.state.story;
    s[1] = e;
    s[2] = "2";
    this.setState({story: s});
  },
  e2Click: function() {
    this.refs.e2.disabled = true;
    this.refs.e1.disabled = false;
    var e = document.getElementById("story-ending2").value;
    var s = this.state.story;
    s[1] = e;
    s[2] = "1";
    this.setState({story: s});
  },
  
  render: function() {
    var nextBtnStyle = { display: 'inline-block', marginRight: 10 };
    var prevBtnStyle = { display: 'inline-block', marginRight: 10 };
    var predicateStyle = {};
    if(this.state.step==0) {
      ReactDOM.render(<FooterInstructionComponent step={0} substep={1} r={1} />, document.getElementById('footer-instructions'));
    }
    else if(this.state.step==1) {
      predicateStyle['display'] = 'inline-block';
      nextBtnStyle['display'] = 'inline-block';
    } else if(this.state.step==2) {
      if(this.state.linkToggle == true) {
        this.refs.prevStep['disabled'] = true;
      } else {
        this.refs.prevStep['disabled'] = false;
      }
      predicateStyle['display'] = 'inline-block';
      nextBtnStyle['display'] = 'none';
    }
    
    if(this.props.index == this.props.i_x) {
      if(this.state.step==0) {
        if(this.state.story[2] != "") {
          document.getElementById("ending" + this.state.story[2]).style.display="block";
        }
        return(
          <div className="predicates">
            <div className="row">
              <div className="col-md-4 col-md-offset-4 text-center">
              <button ref={'e1'} onClick={this.e1Click} style={nextBtnStyle} className='btn step-fwd-btn btn-primary'>Ending 1</button><button ref={'e2'} onClick={this.e2Click} style={nextBtnStyle} className='btn step-fwd-btn btn-primary'>Ending 2</button>
              </div>
            </div>
            <div className="row">
              <SubHeaderInstructionComponent step={this.state.step} />
              <div className="col-md-4 col-md-offset-4 text-center">
                <button ref={'nextStep'} onClick={this.nextStep} style={nextBtnStyle} disabled={!this.state.stepBtn} className='btn step-fwd-btn btn-primary'>Next Step</button>
              </div>
            </div>
          </div>
        );
      } else {
        document.getElementById("ending" + this.state.story[2]).style.display="none";
        return(
          <div className="predicates">
            <div className="row">
              <SubHeaderInstructionComponent step={this.state.step} />
                <div className="col-md-4 col-md-offset-4 text-center">
                <button ref={'prevStep'} onClick={this.prevStep} style={prevBtnStyle} disabled={!this.state.stepBtn} className='btn step-fwd-btn btn-primary'>Previous Step</button>
                <button ref={'nextStep'} onClick={this.nextStep} style={nextBtnStyle} disabled={!this.state.stepBtn} className='btn step-fwd-btn btn-primary'>Next Step</button>
                </div>
            </div>
            <div style={predicateStyle}>
            {
              this.state.predicates.map(function(predicate, i) {
                return (
                  <RuleComponent
                    key={i}
                    index={i}
                    numPreds={this.state.predicates.length}
                    numActions={predicate[0].length}
                    act={predicate[0]}
                    op={predicate[1]}
                    cons={predicate[2]}
                    contextLinks={predicate[3]}
                    consList={this.state.consList}
                    updatePredicate={this.updatePredicate}
                    removePredicate={this.removePredicate}
                    addPredicate={this.addPredicate}
                    addPremise={this.addPremise}
                    addLink={this.addLink}
                    selectedText={this.props.selectedText}
                    step={this.state.step}
                    linkToggle={this.state.linkToggle}
                    linkToggler={this.toggleLink}
                    toggleEdit={this.toggleEdit}
                    edit={this.state.edit}
                    removePremise={this.removePremise}>
                  </RuleComponent>
                  );
              }, this)
            }
            </div>
          </div>
          );
        }
    } else {
      return(false);
    }
  }
});
window.PredicateManager = PredicateManager;
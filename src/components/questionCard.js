import React, { Component } from 'react';
import { Button, Icon, Select, Modal } from 'antd';
import Notes from "./Notes"

const Option = Select.Option;
const baseUrl = 'https://beerboardapi.herokuapp.com/'
let deleteid;

class QuestionCard extends Component {

  constructor(props) {
  super(props);

  this.state = {
    submitModalIsOpen: false,
    deleteModalIsOpen: false,
    updateModalIsOpen: false,
    solvers_here: [],
    toggleClass: true,
    selectedValue: '',
    solvers: [],
    solvedBy: [],
    formData: {...props.question},
    newSolver: ""
  };

  this.openSubmitModal = this.openSubmitModal.bind(this);
  this.closeSubmitModal = this.closeSubmitModal.bind(this);
  this.openDeleteModal = this.openDeleteModal.bind(this);
  this.closeDeleteModal = this.closeDeleteModal.bind(this);
  this.openUpdateModal = this.openUpdateModal.bind(this);
  this.closeUpdateModal = this.closeUpdateModal.bind(this);
  this.cancelDelete = this.cancelDelete.bind(this);
  this.cancelUpdate = this.cancelUpdate.bind(this);
  this.handleChange = this.handleChange.bind(this);
  this.deleteName = this.deleteName.bind(this);
  this.createOptionsList = this.createOptionsList.bind(this);
  this.submitSolver = this.submitSolver.bind(this);
  this.getSolvedBy = this.getSolvedBy.bind(this);
  this.onSolverSubmit = this.onSolverSubmit.bind(this);
  this.deleteBoth = this.deleteBoth.bind(this);
  }

  componentDidMount () {
    this.getSolvedBy(this.props.question.id)
  }

  toggleFunction = () => {
    this.setState({toggleClass: !this.state.toggleClass})
  }

  openSubmitModal() {
    this.setState({submitModalIsOpen: true});
    this.setState({solvers_here: this.props.solvers.map(
      item => item.solver_name)})
  }

  closeSubmitModal() {
    this.setState({submitModalIsOpen: false});
  }

  cancelDelete() {
    this.setState({deleteModalIsOpen: false});
  }

  cancelUpdate() {
    this.setState({updateModalIsOpen: false});
  }

  submitSolver(event) {
    event.preventDefault();
    this.getSolvedBy(event);
    this.setState({submitModalIsOpen: false});
  }

  openDeleteModal() {
    this.setState({deleteModalIsOpen: true});
  }

  openUpdateModal() {
    this.setState({updateModalIsOpen: true});
  }

  deleteName(e) {
    e.preventDefault()
    this.onDelete(this.state.selectedValue, baseUrl + 'solvers/');
  }

  closeDeleteModal() {
    this.setState({deleteModalIsOpen: false});
    this.onDeleteQuestion(this.props.question.id, baseUrl + 'questions/');
  }

  onDelete(id, url) {
    return fetch(url + id, {
      method: 'delete',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
    .then(res => {window.location.href = './deleted'; return res})
    .then(data => {
      if (!data) return console.error('no data on delete response');
        this.setState({solvers: data})})
  }

  onDeleteQuestion = (id, url) => {
    if (this.state.solvedBy.length > 0) {
      this.state.solvedBy.forEach(item => {
      this.deleteBoth(item, id, url)})
    } else {
      return fetch(url + id, {
        method: 'delete',
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      })
      .then(res => {window.location.href = './deleted'; return res})
      .then(data => {
        if (!data) return console.error('no data on delete response');
          this.setState({solvers: data})})
    }
  }

  deleteBoth(item, id, url) {
    this.props.solvers.forEach(solver => {
      if (solver.solver_name === item.solver_name) {
        deleteid = solver.id
        this.props.questions_solvers.forEach(item => {
            if (item.questions_id === this.props.question.id && item.solvers_id === deleteid) {
              return fetch(baseUrl + 'questions_solvers/' + item.id, {
                method: 'delete',
                headers: new Headers({
                  'Content-Type': 'application/json'
                })
              })
              .then(data => {
                    if (!data) return console.error('no data on delete response');
                      this.setState({solvers: data})})
              .then(() => { return fetch(url + id, {
                  method: 'delete',
                  headers: new Headers({
                    'Content-Type': 'application/json'
                  })
                })
                .then(res => {window.location.href = './deleted'; return res})
                .then(data => {
                  if (!data) return console.error('no data on delete response');
                    this.setState({solvers: data})})
              })
            }
        return deleteid
      }
    )}}
  )
  }

  closeUpdateModal() {
    this.setState({updateModalIsOpen: false});
  }

  handleChange (e) {
      this.setState({selectedValue: e.target.value})
    }

  createOptionsList (item, index) {
      return (
        <Option key={item.id} value={item.id}>
          {item.solver_name}
        </Option>
      );
  }

  getSolvedBy (questionId) {
    let url = baseUrl + 'solvedby/' + questionId;
    fetch(url)
      .then(res => res.json())
      .then(res => {
        this.setState({
          solvedBy: res.solvers
        })
      })
      .catch(error => console.error('Error:', error))
  }

  onSolverSubmit = (event) => {
    event.preventDefault()
    const question_solver = ({
      "id": this.getId(this.props.questions_solvers),
      "questions_id": this.props.question.id,
      "solvers_id": parseInt(this.state.selectedValue)
    })
    this.props.addSolvedBy(question_solver)
  }

  getId = (array) => {
    let max = 0;
    return array.forEach(item => {
      if (item.id > max) {
        max = item.id
      }
    });
  }

  render() {

    let solvedByName = this.state.solvedBy.map(person => {
      return <span key={person.solver_name} className='solvedbyitem'><br/>{person.solver_name}</span>
    })

    return (
      <div className="card">

        <main className='maincard'>

          <h2 className='cardname'>#{this.props.question.id + ': ' + this.props.question.question_name}</h2>
          <div className="card-body">
            <div className='cardtext'>
              <div id='questionText'><strong>Question:</strong><br></br>{this.props.question.question.split("\n").map((i, index)=> {
            return <div key={Math.random()}>{i}</div>;})}</div>
              <div id='solutionText' ><strong>Solution:</strong> <span onClick={this.toggleFunction} className='clicktext'>Click to show/hide <Icon type={this.state.toggleClass?'plus-square':'minus-square'} /></span><br></br><span className={this.state.toggleClass?'hidden solutionLine':'solutionLine'}>{this.props.question.solution.split("/n").map((i, index) => {
            return <pre key={Math.random()}>{i}</pre>;})}</span></div>
              <p id='submitText'><strong>Submitted by:</strong> {this.props.question.submitter}</p>
              <p id='solverText'><strong>Solved by:</strong>{solvedByName}</p>
             
            </div>
          </div>

          <aside className="cardbuttons">
              <Button id='ant-btn-primary'onClick={this.openSubmitModal} type="primary">Solved! <Icon type="check-circle-o" /></Button>
              <Button id='delete' onClick={this.openDeleteModal} type="danger">Delete <Icon type="delete" /></Button>
              <Button id='update' onClick={this.openUpdateModal} type="primary">Update <Icon type="edit" /></Button>
          </aside>
          <Notes/>
        </main>




        <Modal
          visible={this.state.submitModalIsOpen}
          onRequestClose={this.closeSubmitModal}
          contentLabel="Solved Modal"
          onCancel={this.closeSubmitModal}
        >
        <h2 ref={subtitle => this.subtitle = subtitle}>What a champion!</h2>
        <form>
          <Select defaultValue='Choose your name' onChange={(value) => this.setState({selectedValue: value})} name="name">
            {this.props.solvers.map(this.createOptionsList)}
          </Select >
          <Button type='primary' onClick={this.onSolverSubmit}>Submit</Button>
        </form>
        <form>
          <label>Don't see your name in the list? Add it:</label>
          <input type='text' name='newsolver' onChange={(e)=>{this.setState({newSolver: e.target.value})}}></input>
          <Button className='addnamebtn' onClick={(e)=>this.props.postName(this.state.newSolver)} type='submit' value='Add name'>Add Name</Button>
        </form>
        <form id="deleteform" onSubmit={this.deleteName}>
          <label>Delete a person (cruel!):</label>
          <Select defaultValue='Pick a person' getPopupContainer={() => document.getElementById('deleteform')} onChange={(value) => this.setState({selectedValue: value})} name="name" id="namelist">
            {this.props.solvers.map(this.createOptionsList)}
          </Select >
          <input id='delete' type='submit' value='Delete name forever'/>
        </form>
        </Modal>

        <Modal
          visible={this.state.deleteModalIsOpen}
          isOpen={this.state.deleteModalIsOpen}
          onRequestClose={this.cancelDelete}
          onCancel={this.cancelDelete}
          closable={false}
          contentLabel="Delete Modal"
        >
        <p>Are you sure you want to delete this question <strong>and all of the data </strong>that goes with it?</p>
        <Button className='finalQdelete' id='delete' type="danger" onClick={this.closeDeleteModal}>Delete!</Button>
        <Button type="primary" onClick={this.cancelDelete}>Cancel</Button>
        </Modal>

        <Modal
          visible={this.state.updateModalIsOpen}
          isOpen={this.state.updateModalIsOpen}
          onRequestClose={this.closeUpdateModal}
          onCancel={this.closeUpdateModal}
          contentLabel="Update Modal"
        >
          <h3>Update the question</h3>
          <p className='updateInstr'>Fill in all the fields and the question will be updated.</p>
          <form className='addform' id='form' onSubmit={this.props.onSubmitUpdate}>
            <label className='add qid-label hidden' htmlFor="qid">Question ID:</label>
            <input className='add qid-field hidden' type="text" name="qid" defaultValue={this.state.formData.id}></input>
            <label className='add qname-label' htmlFor="qname" >Question Name:</label>
            <input className='add qname-field' type="text" name="qname" defaultValue={this.state.formData.question_name}></input>
            <label className='add qtext-label' htmlFor="qtext">Question: </label>
            <textarea className='add qtext-field' name="qtext" rows="5" defaultValue={this.state.formData.question}></textarea>
            <label className='add sname-label' htmlFor="solution">Solution: </label>
            <textarea className='add sname-text' name="solution" rows="5" defaultValue={this.state.formData.solution}></textarea>
            <label className='add subm-label' htmlFor="submitter">Your First and Last Name:</label>
            <input className='add subm-text' type="text" name="submitter" defaultValue={this.state.formData.submitter}></input>
            <input className='add addqbutn' type="submit" value="Submit"/>
          </form>
        </Modal>

      </div>
    );
  }
}

export default QuestionCard;

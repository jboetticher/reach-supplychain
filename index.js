import ReactDOM from 'react-dom';
import React from 'react';
import './index.css';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';

const intToTransition = [ "Relocation", "Purchase", "Processing" ];
const intToUnits = [ "Units", "Kg", "Tons" ];
const intToState = [ "Production", "Storage", "Usage" ];
const intToSupply = [ "Lumber", "Concrete", "Steel" ];

const {standardUnit} = reach;
const defaults = {defaultFundAmt: '10', defaultWager: '3', standardUnit};

// Root App
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: 'ConnectAccount', ...defaults};
  }

  async componentDidMount() {
    console.log("Component mounting...");
    const acc = await reach.getDefaultAccount();
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    this.setState({acc, bal});

    // Removed faucet functionality. Unnecessary for quick implementation
    /*
    try {
      const faucet = await reach.getFaucet();
      this.setState({view: 'FundAccount', faucet});
    } catch (e) {
      this.setState({view: 'DeployerOrAttacher'});
    }
    */
    console.log("Component mounted.");
  }

  // Removed faucet functionality.
  /*
  async fundAccount(fundAmount) {
    await reach.transfer(this.state.faucet, this.state.acc, reach.parseCurrency(fundAmount));
    this.setState({view: 'DeployerOrAttacher'});
  }
  async skipFundAccount() { this.setState({view: 'DeployerOrAttacher'}); }
  */


  render() { 
    return <Transactor props={this.state} />; 
  }
}

// Definition of the Transactor participant
class Transactor extends React.Component {
  random() { return reach.hasRandom.random(); }

  viewData(data) {
      console.log(data);
      this.setState({ chainState: data });
  }

  async createTransaction() {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(5000);

    return {
      transition: {
        transitionName: 0, // isTransition
        inventoryUnit: 0,  // isUnit
        inventoryValue: 0,
        date: 0,
      },
      state: {
        supplyName: 0,
        stateName: 0,
        inventoryUnit: 0,
        inventoryValue: 0,
        date: 0,
      }
    }
  }

  createChain() {
    return {
      supplyName: 0,
      stateName: 0,
      inventoryUnit: 0,
      inventoryValue: 0,
      date: 0,
    }
  }


  // example of user interaction
  async getHand() { // Fun([], UInt)
    const hand = await new Promise(resolveHandP => {
      this.setState({view: 'GetHand', playable: true, resolveHandP});
    });
    this.setState({view: 'WaitingForResults', hand});
    return hand;
  }

  render() {
    return(
      <>
      <AppView props={this.state} />
      </>
    )
  }
}

// What's Displayed
let AppView = props => {
  return(
    <div>Deez Nuts</div>
  );
}


ReactDOM.render(
  <React.StrictMode><App /></React.StrictMode>,
  document.getElementById('root')
);

import React from 'react';
import './App.css';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

//screens
import Index from './screens/Index';
import Create from './screens/Create';
import Show from './screens/Show';
import Edit from './screens/Edit';

class App extends React.Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/" component={Index} />
                    <Route exact path="/create" component={Create} />
                    <Route exact path="/show/:uid" component={Show} />
                    <Route exact path="/edit/:uid" component={Edit} />
                    <Route render={() => <div>Page not found.</div>} />
                </Switch>
            </Router>
        );
    }
}

export default App;

import React from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';

import firebase, { db } from '../Firebase';

import '../App.css';

class Index extends React.Component {

    state = {
        listData: [],
    }

    //db変化時のコールバック
    onCollectionUpdate = (querySnapshot) => {
        const docs = querySnapshot.docs.map(doc => doc.data());
        this.setState({ listData: docs });
    }

    componentDidMount = () => {
        //dbの変化を監視（変化が無くても初回は実行される）
        this.unsubscribe = db.collection("members")
            .orderBy('createdAt', 'desc')
            .onSnapshot(this.onCollectionUpdate);
    }

    componentWillUnmount = () => {
        //subscribe停止
        this.unsubscribe();
    }

    render() {
        return (
            <div className="container">
                <h3 className="text-center my-5">メンバー一覧</h3>
                <Link to="/create"><Button color="primary" className="m-2">新規登録</Button></Link>
                <table className="table">
                    <thead>
                        <tr>
                            <th>UID</th>
                            <th>Email</th>
                            <th>gender</th>
                            <th>Avatar</th>
                            <th>詳細</th>
                            <th>編集</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.listData.map(member => (
                                <tr key={member.docId} style={member.gender === "female" ? { background: "#ffe4e1" } : {}}>
                                    <td>{member.docId}d</td>
                                    <td>{member.email}</td>
                                    <td>{member.gender}</td>
                                    <td><img src={member.avatarUrl} height="30" width="30" alt="" /></td>
                                    <td><Link to={`/show/${member.docId}`}><Button size="sm" color="primary">詳細</Button></Link></td>
                                    <td><Link to={`/edit/${member.docId}`}><Button size="sm" color="success">編集</Button></Link></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Index;

const styles = {
    female: {
        background: "#ffe4e1",
    }
}

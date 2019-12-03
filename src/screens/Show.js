import React from 'react';
import firebase, { db } from '../Firebase';
import { Link } from 'react-router-dom';
import moment from 'moment';

class Show extends React.Component {

    state = {
        member: {}
    }

    getMember = async (uid) => {
        const docRef = db.collection("members").doc(uid);
        const doc = await docRef.get();
        if (doc.exists) {
            this.setState({
                member: doc.data(),
            });
        } else {
            alert("メンバーが見つかりませんでした。");
        }
    }

    componentDidMount = async () => {
        await this.getMember(this.props.match.params.uid);
    }

    render() {

        if(this.state.member.createdAt === undefined){
            return <p>Loading...</p>
        }

        return (
            <div className="container">
                <h3 className="text-center my-5">メンバー詳細</h3>
                <div className="text-right my-3 mr-5"><Link to="/">一覧へ戻る</Link></div>
                <table className="table">
                    <tbody>
                        <tr>
                            <th>UID</th>
                            <td>{this.state.member.docId}</td>
                        </tr>
                        <tr>
                            <th>Email</th>
                            <td>{this.state.member.email}</td>
                        </tr>
                        <tr>
                            <th>居住地域</th>
                            <td>{this.state.member.area}</td>
                        </tr>
                        <tr>
                            <th>Avatar</th>
                            <td><img src={this.state.member.avatarUrl} width="200" alt="" /></td>
                        </tr>
                        <tr>
                            <th>性別</th>
                            <td>{this.state.member.gender}</td>
                        </tr>
                        <tr>
                            <th>生年月日？</th>
                            <td>{moment(this.state.member.birthday.seconds * 1000).format('YYYY/MM/DD')}</td>
                        </tr>
                        <tr>
                            <th>同意</th>
                            <td>{String(this.state.member.agree)}</td>
                        </tr>
                        <tr>
                            <th>登録日時</th>
                            <td>{ moment(this.state.member.createdAt.seconds * 1000).format('YYYY-MM-DD HH:mm:dd:ss')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Show;

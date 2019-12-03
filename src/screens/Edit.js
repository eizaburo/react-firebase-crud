import React from 'react';
import { Form, FormGroup, FormFeedback, Label, Input, Button, Spinner } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

import firebase, { db } from '../Firebase';

import FileUploader from "react-firebase-file-uploader";

import moment from 'moment';

//react-datepicker
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
//for locale ja
import ja from 'date-fns/locale/ja';
registerLocale('ja', ja);

class Edit extends React.Component {

    state = {
        avatarUrl: '',
        avator: '',
        isUploading: false,
        progress: 0,
        spinnerHidden: true,
        member: { email: '', area: '', gender: '', birthday: '', avatarUrl: '', agree: false }, //初期値ないとWarning出る
    }

    handleOnSubmit = async (values) => {
        // alert(JSON.stringify(values));
        this.setState({ spinnerHidden: false });

        //dbへ書き込み
        const docId = this.props.match.params.uid;
        await db.collection("members").doc(docId).update({
            email: values.email,
            area: values.area,
            gender: values.gender,
            birthday: firebase.firestore.Timestamp.fromDate(new Date(values.birthday)),
            avatarUrl: values.avatarUrl,
            agree: values.agree,
        });

        this.setState({ spinnerHidden: true });
        alert("更新しました。");
    }

    //upload
    handleUploadStart = () => this.setState({ isUploading: true, progress: 0 });
    handleUploadError = error => {
        this.setState({ isUploading: false });
        console.log(error);
    }
    handleUploadSuccess = async filename => {
        await this.setState({ avator: filename, isUploading: false });
        const url = await firebase.storage().ref("images").child(filename).getDownloadURL();
        await this.setState({ avatarUrl: url });
        return url;
    }
    handleProgress = progress => this.setState({ progress: progress });

    //for Edit
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

    componentDidMount = () => {
        this.getMember(this.props.match.params.uid);
    }

    deleteMember = async (uid) => {
        if (window.confirm('本当に削除しますか？')) {
            await db.collection("members").doc(uid).delete();
            this.props.history.push("/");
        } else {
            return;
        }
    }

    render() {
        return (
            <div className="container">
                <h3 className="text-center my-5">情報編集</h3>
                <div className="text-right my-3 mr-5"><Link to="/">一覧へ戻る</Link></div>
                <Formik
                    enableReinitialize //これがポイント
                    initialValues={{
                        email: this.state.member.email, //各初期値にdbからの値（このためにenableReinitializeが必要）
                        area: this.state.member.area,
                        gender: this.state.member.gender,
                        birthday: moment(this.state.member.birthday.seconds * 1000).format('YYYY/MM/DD'),
                        avatarUrl: this.state.member.avatarUrl,
                        agree: this.state.member.agree,
                    }}
                    onSubmit={this.handleOnSubmit}
                    validationSchema={Yup.object().shape({
                        email: Yup.string().email().required(),
                        area: Yup.string().oneOf(['関東', '関西']).required(),
                        gender: Yup.string().oneOf(['male', 'female']).required(),
                        avatarUrl: Yup.string().required(),
                        agree: Yup.boolean().oneOf([true]).required(),
                    })}
                >
                    {
                        ({ handleSubmit, handleChange, handleBlur, values, errors, touched, setFieldValue }) => (
                            <Form className="col-8 mx-auto" onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label for="email">■Email</Label>
                                    <Input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        invalid={Boolean(touched.email && errors.email)}
                                    />
                                    <FormFeedback>
                                        {errors.email}
                                    </FormFeedback>
                                </FormGroup>
                                <FormGroup>
                                    <Label>■お住いの地域</Label>
                                    <Input
                                        type="select"
                                        name="area"
                                        id="area"
                                        value={values.area}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        invalid={Boolean(touched.area && errors.area)}
                                    >
                                        <option value="選択して下さい">選択して下さい</option>
                                        <option value="関東">関東</option>
                                        <option value="関西">関西</option>
                                    </Input>
                                    <FormFeedback>
                                        {errors.area}
                                    </FormFeedback>
                                </FormGroup>
                                <FormGroup className="mb-4">
                                    <legend className="col-form-label">■性別</legend>
                                    <FormGroup inline check>
                                        <Label check>
                                            男性：<Input
                                                type="radio"
                                                name="gender"
                                                id="male"
                                                value="male"
                                                onChange={handleChange}
                                                checked={values.gender === "male"} //追加
                                            />
                                        </Label>
                                    </FormGroup>
                                    <FormGroup inline check>
                                        <Label check>
                                            女性：<Input
                                                type="radio"
                                                name="gender"
                                                id="female"
                                                value="female"
                                                onChange={handleChange}
                                                checked={values.gender === "female"} //追加
                                            />
                                        </Label>
                                    </FormGroup>
                                    <span className="text-danger small">{touched.gender && errors.gender ? errors.gender : null}</span>
                                </FormGroup>
                                <FormGroup>
                                    <legend className="col-form-label">■直近の誕生日</legend>
                                    <DatePicker
                                        locale="ja"
                                        name="birthday"
                                        id="birthday"
                                        value={values.birthday}
                                        dateFormat="yyyy/MM/dd"
                                        customInput={<Input invalid={Boolean(errors.birthday)} />}
                                        onChange={date => setFieldValue("birthday", moment(date).format('YYYY/MM/DD'))}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <legend className="col-form-label">■プロファイル画像</legend>
                                    <FileUploader
                                        accept="image/*"
                                        name="avatarUrl"
                                        randomizeFilename
                                        storageRef={firebase.storage().ref("images")}
                                        onUploadStart={this.handleUploadStart}
                                        onUploadError={this.handleUploadError}
                                        onUploadSuccess={async (filename) => {
                                            const path = await this.handleUploadSuccess(filename); //ここもawaitにしないとurl取得できない
                                            setFieldValue("avatarUrl", path); //値のセットとエラーの削除
                                        }}
                                        onProgress={this.handleProgress}
                                    />
                                    <span className="text-danger small">{touched.avatarUrl && errors.avatarUrl ? errors.avatarUrl : null}</span>
                                    {this.state.isUploading ? <p>Uploading... {this.state.progress}%</p> : null}
                                    {/* sateからvaluesへ参照を切り替え */}
                                    {values.avatarUrl ? <img src={values.avatarUrl} width="120" alt="" className="my-2" /> : null}
                                </FormGroup>
                                <FormGroup className="my-4">
                                    <legend className="col-form-label">■規約に同意して下さい。</legend>
                                    <FormGroup inline check>
                                        <Input
                                            type="checkbox"
                                            name="agree"
                                            id="agree"
                                            value={values.agree}
                                            onChange={handleChange}
                                            checked={values.agree === true}
                                        />
                                        <Label for="agree" check>同意する。</Label>
                                        <span className="text-danger small">{touched.agree && errors.agree ? errors.agree : null}</span>
                                    </FormGroup>

                                </FormGroup>
                                <div>
                                    <Button type="submit" color="success">
                                        <Spinner color="light" size="sm" className="mr-1" hidden={this.state.spinnerHidden} />
                                        更新する
                                        </Button>
                                </div>
                            </Form>
                        )
                    }
                </Formik>
                <div className="col-8 mx-auto my-3">
                    <Button color="danger" onClick={() => this.deleteMember(this.props.match.params.uid)}>データを削除</Button>
                </div>
            </div>
        );
    }
}

export default Edit;

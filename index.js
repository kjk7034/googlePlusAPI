import Backbone from 'backbone';
import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
require('./sample.css');

const Google = {
	Model: {
		PostComments: class extends Backbone.Collection {
			initialize(models, options) {
				this.postId = options.postId
			}
			parse(response) {
				return response.items;
			}
			url() {
				return `https://www.googleapis.com/plus/v1/activities/${this.postId}/comments`;
			}
		},
		User: class extends Backbone.Model {
			initialize() {
				this.urlRoot = 'https://www.googleapis.com/plus/v1/people/me';
			}
		},
		UserFeed: class extends Backbone.Collection {
			initialize(models, options) {
				this.userId = options.userId
			}
			parse(response) {
				return response.items;
			}
			url() {
				return `https://www.googleapis.com/plus/v1/people/${this.userId}/activities/public`;
			}
		}
	},
	View: {
		PostComments: class extends React.Component {
			constructor() {
				super();
				this.state = {
				}
			}
			componentDidMount() {
				if (this.props.postId) {
					this.fetch(this.props.postId);
				}
			}
			fetch(postId) {
				var collection = new Google.Model.PostComments(null, {
					postId: postId
				});
				return collection.fetch({
					data: {
						access_token: this.props.accessToken
					}
				}).then((response) => {
					this.setState({
						fetchData: response.items
					});
					return response;
				});
			}
			render() {
				if (!this.state.fetchData) {
					return (
						<div className="loading"></div>
					);
				}
				if (!this.state.fetchData.length) {
					return null;
				}

				var items = this.state.fetchData.map((currentValue, index) => {
					var createdTime = moment(currentValue.published).format('YYYY-MM-DD HH:mm:ss');
					var commentContent = currentValue.object.content;
					var writer = currentValue.actor.displayName
					return(
						<div key={index} className="commentBox">
							<div>작성자 : {writer}</div>
							<div>댓글 : <div dangerouslySetInnerHTML={{__html: commentContent}} /></div>
							<div>댓글 작성 시간 : {createdTime}</div>
						</div>
					)
				});
				return (
					<div className='postComments'>
						<div className="totalCommentCount">전체 댓글 수 : {this.state.fetchData.length}</div>
						{items}
					</div>
				);
			}
		},
		User: class extends React.Component {
			constructor() {
				super();
				this.state = {
				}
			}
			componentDidMount() {
				this.fetch();
			}
			fetch() {
				var model = new Google.Model.User();
				return model.fetch({
					data: {
						access_token: this.props.accessToken
					}
				}).then((response) => {
					this.setState({
						fetchData: response
					});
					return response;
				});
			}
			render() {
				if (!this.state.fetchData) {
					return (
						<div className="loading"></div>
					);
				}
				return (
					<div className="userWrap">
						<h1 className="userId">User ID : {this.state.fetchData.id}</h1>
						<Google.View.UserFeed accessToken={this.props.accessToken} postId={this.state.fetchData.id} />
					</div>
				)
			}
		},
		UserFeed: class extends React.Component {
			constructor() {
				super();
				this.state = {
				}
			}
			componentDidMount() {
				this.fetch(this.props.postId);
			}
			fetch(userId) {
				var collection = new Google.Model.UserFeed(null, {
					userId: userId
				});
				return collection.fetch({
					data: {
						access_token: this.props.accessToken
					}
				}).then((response) => {
					this.setState({
						fetchData: response.items
					});
					return response;
				});
			}
			render() {
				if (!this.state.fetchData) {
					return (
						<div className="loading"></div>
					);
				}
				var items = this.state.fetchData.map((currentValue, index) => {
					var createdTime = moment(currentValue.published).format('YYYY-MM-DD HH:mm:ss');
					var title = currentValue.title;
					if(currentValue.object.attachments) {
						var attachments = currentValue.object.attachments.map((currentValue, index) => {
							switch (currentValue.objectType) {
								case "album" :
									var attachFile = currentValue.thumbnails.map((currentValue, index) => {
										return (
											<div key={index}>
												<img src={currentValue.image.url} alt={currentValue.description} />
											</div>
										)
									})
									break;
								case "photo" :
									var attachFile = <img src={currentValue.image.url} alt={currentValue.displayName} />
									break;
								default :
									var attachFile = null;
									break;
							}
							return (
								<div className="feedAttach" key={index}>
									<div>등록시간 : {createdTime}</div>
									<div>앨범 타입 : {currentValue.objectType}</div>
									{attachFile}
								</div>
							)
						})

					} else {
						var attachments = null
					}
					return(
						<div className="feedBox" key={index}>
							<div className="feedTitle">제목 {index+1}. {title}</div>
							{attachments}
							<Google.View.PostComments accessToken={this.props.accessToken} postId={currentValue.id} />
						</div>
					)
				});
				return (
					<div>{items}</div>
				);
			}
		}
	}
}

class GoogleApp extends React.Component {
	constructor() {
		super();
		this.state = {
		}
	}
	render() {
		return (
			<div className="wrapper">
				<Google.View.User accessToken={this.props.accessToken} />
			</div>
		);
	}
}


ReactDOM.render(
	<GoogleApp accessToken='ya29.CjHyAjtiHXoy6WLkNVFrWP5VB8QMT0IMFdXOpU_5L7eqFkrYwFpCtkeOMLIloPZKXYe_' />,
	document.getElementById('container')
);

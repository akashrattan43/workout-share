import React from 'react';
import {connect} from 'react-redux';
import {loadPostsAsync} from '../../store/actions/index'
import classes from './MyWorkouts.module.css';
import Feed from '../../containers/Feed/Feed';
import {Route} from 'react-router-dom';
import Inspect from '../../containers/Inspect/Inspect';
import empty2 from '../../images/empty2.svg';
import axios from '../../axios';
import routeToType from '../../helper/route-to-type';
import * as actionTypes from '../../store/actions/actionTypes';
import CircularProgress from '@material-ui/core/CircularProgress';
import InfiniteScroll from 'react-infinite-scroller';


class MyWorkouts extends React.Component {

    state = {
        search: null,
        searchID: null,
        numWorkouts: null
    }

    componentDidMount() {
        this.props.onLoadPosts('/my-workouts');
        if (this.props.history.location.search.length > 0) {
            this.checkSearchHandler();
        }
        window.scrollTo(0, 0)
    }

    componentDidUpdate() {
        if (this.state.search !== this.props.history.location.search) {
            this.checkSearchHandler();
        }

        if (this.props.myWorkouts && this.state.numWorkouts !== this.props.myWorkouts.length) {
            this.setState({
                numWorkouts: this.props.myWorkouts.length
            });
        }
    }

    loadPostsHandler = () => {
        if (this.props.hasMore && !this.props.loading) {
            this.props.onLoadPosts(this.props.history.location.pathname, this.props.myWorkouts.length);
        }
    }

    checkSearchHandler = () => {
        const query = new URLSearchParams(this.props.location.search);
        let searchID = null
        for (let param of query.entries()) {
            searchID = param[1];
        }
        this.setState({
            searchID: searchID,
            search: this.props.history.location.search
        });
        if (searchID && searchID.length > 0) {
            axios.get('/workouts/' + searchID)
            .then(res => {
                this.props.onSetInspect(res.data, routeToType(this.props.history.location.pathname));
                this.setState({currentPath: this.props.history.location.pathname});
            })
            .catch(err => {
                console.log(err)
            });
        }
    }

    render() {

        return <>
            <Route path={this.props.history.location.pathname} exact component={Inspect}/>  
            <div className={classes.MyWorkouts}>
                <h1 className={classes.Header}>My Workouts</h1>

                {(this.props.myWorkouts && this.props.myWorkouts.length > 0) || this.props.loading ?
                    <InfiniteScroll
                    loadMore={this.loadPostsHandler}
                    hasMore={this.props.hasMore}
                    loader={<CircularProgress/>}
                    style={!this.props.hasMore && this.props.myWorkouts.length === 0 ? {display: 'none'}: {}}
                    >
                        <Feed myWorkouts history={this.props.history} darkTitles workouts={this.props.myWorkouts}/>
                    </InfiniteScroll>
                : 
                    <div style={{width: '80%', maxWidth: '600px', margin: 'auto'}}>
                        <h2 className={classes.EmptyText}>Hmm, looks like you haven't posted yet.</h2>
                        <p className={classes.EmptySubext}>Remember: Workout Share is personalized out of the box, so <strong>no account needed.   Ever.</strong></p>
                        <img className={classes.EmptyImage} src={empty2}/>
                    </div>
                }
            </div>
        </>
    }
}

const mapStateToProps = state => {
    return {
        myWorkouts: state.load.myWorkouts.posts,
        hasMore: state.load.myWorkouts.hasMore,
        likedIDs: state.auth.likedIDs,
        loading: state.load.loading
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onLoadPosts: (route, numPosts) => dispatch(loadPostsAsync(route, numPosts)),
        onSetInspect: (workout, type) => dispatch({type: actionTypes.SET_INSPECT, workout: workout, select: type})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyWorkouts);
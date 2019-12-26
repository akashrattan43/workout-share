import React from 'react';
import {Route} from 'react-router-dom';
import routeToType from '../../../helper/route-to-type';

// Style
import classes from './All.module.css'
import CircularProgress from '@material-ui/core/CircularProgress';
import Empty from '../../../images/empty.svg';

// import LoadMore from '../../../components/LoadMore/LoadMore';
import InfiniteScroll from 'react-infinite-scroller';
import Feed from '../../../components/feed/Feed';
import Inspect from '../../../containers/Inspect/Inspect';

// Redux and axios
import axios from '../../../axios';
import * as actionTypes from '../../../store/actions/actionTypes';
import {connect} from 'react-redux';
import {loadPostsAsync} from '../../../store/actions/index'

import NotFound from '../../../components/UI/404/NotFound';

class All extends React.Component {

    state = {
        currentPath: this.props.history.location.pathname,
        search: this.props.location.search,
        searchID: null

        // In order to enforce a re-render of the cards (without deleting them from our redux state) to complete the phase-in animation regardless
        // of the previous path. This is strictly for changing the path from / or all to other browse paths.
    }

    componentDidMount() {
        //Checking if this page has already been loaded and saved in redux
        if (this.props.history.location.search) {
            this.updateSearchHandler();
        }
        window.scrollTo(0, 0)
        // const loadedWorkouts = this.props[routeToType(this.props.history.location.pathname)].posts;
        // if (loadedWorkouts) {
        //     this.props.onLoadPosts(this.props.history.location.pathname)
        // }
    }

    componentDidUpdate() {

        const loadedWorkouts = this.props[routeToType(this.props.history.location.pathname)].posts;

        // if (loadedWorkouts.length === 0 && this.state.currentPath !== this.props.history.location.pathname) {
        //     this.loadPostsHandler();
        // }
        

        if (this.state.search !== this.props.location.search) {
            this.updateSearchHandler();
        }
    }

    updatePathHandler = () => {
        this.setState({
            currentPath: this.props.history.location.pathname
        });
        window.scrollTo(0, 0)
    }

    loadPostsHandler = () => {
        const load = this.props[routeToType(this.props.history.location.pathname)]
        if (load.hasMore && !this.props.loading) {
            this.props.onLoadPosts(this.props.history.location.pathname, load.posts.length);
        }
    }

    redirectToCreateHandler = () => {
        this.props.history.push('/create');
    }

    updateSearchHandler = () => {
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
                console.log(res)
                this.props.onSetInspect(res.data, routeToType(this.props.history.location.pathname));
                this.setState({currentPath: this.props.history.location.pathname});
            })
            .catch(err => {
                console.log(err)
            });
        }
    }

    render() {
        const load = this.props[routeToType(this.props.history.location.pathname)];
        if (!load) {
            return <NotFound/>
        }
        const workouts = load.posts;
        const hasMore = load.hasMore;
        if (this.state.currentPath === this.props.history.location.pathname) {
            
            return <div style={{textAlign: 'center'}}>
                <Route path={this.props.history.location.pathname} exact component={Inspect}/>
                {/* <Feed history={this.props.history} darkTitles workouts={workouts}/>
                <LoadMore 
                loadPosts={this.loadPostsHandler} 
                display={hasMore}
                loading={this.props.loading}/> */}
                <InfiniteScroll
                    loadMore={this.loadPostsHandler}
                    hasMore={hasMore}
                    loader={<CircularProgress/>}
                >
                    <Feed history={this.props.history} darkTitles workouts={workouts}/>
                </InfiniteScroll>
                
                {!hasMore ? 
                    <div className={classes.EndBox}>
                        <h2 className={classes.CtaHeader}>Looked a bit empty?</h2>
                        <p className={classes.CtaText}>Feel free to create your own workouts to keep track of your routine or to share with friends.</p>
                        <p className={classes.CtaText}>No account needed!</p>
                        <button onClick={this.redirectToCreateHandler} className={classes.CtaButton}>Take me there!</button>
                        <img className={classes.EmptyImage} src={Empty}/>
                    </div>
                : null}

                {this.props.error ? <p>{this.props.error}</p>: null}
            </div>
        } else {
            this.updatePathHandler()
            return null
        }
        
    }
}

const mapStateToProps = state => {
    return {
        all: state.load.all,
        powerlifting: state.load.powerlifting,
        bodybuilding: state.load.bodybuilding,
        weightlifting: state.load.weightlifting,
        endurance: state.load.endurance,
        crossfit: state.load.crossfit,
        loading: state.load.loading
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onLoadPosts: (route, numPosts) => dispatch(loadPostsAsync(route, numPosts)),
        onSetInspect: (workout, type) => dispatch({type: actionTypes.SET_INSPECT, workout: workout, select: type})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(All);
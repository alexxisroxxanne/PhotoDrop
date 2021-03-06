var React = require('react-native');
var NavigationBar = require('react-native-navbar');
var _ = require('lodash');
var api = require('../Utils/api');
var IconIon = require('react-native-vector-icons/Ionicons');
var PhotoSwiperView = require('./PhotoSwiperView');
var StanzaSwiperView = require('./StanzaSwiperView');
var {AudioRecorder, AudioPlayer} = require('react-native-audio');


var {
  Navigator,
  StyleSheet,
  View,
  Text,
  Dimensions,
  Image,
  ScrollView,
  ActivityIndicatorIOS,
  StatusBarIOS,
  TouchableHighlight,
  SegmentedControlIOS,
  RefreshControl,
} = React;

var {width, height} = Dimensions.get('window');
var IMAGES_PER_ROW = 3

class PhotosView extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      currentScreenWidth: width,
      currentScreenHeight: height,
      imageUrls: undefined,
      userId: this.props.route.userId,
      previousComponent: this.props.route.previousComponent,
      latitude: this.props.route.latitude,
      longitude: this.props.route.longitude,
      statusBarHidden: false,
      favorites: this.props.route.favorites,
      selectedIndex: 0,
      userPhotosUrls: undefined,
      userFavoritesUrls: undefined,
      allViewablePhotos: undefined,
      stanzas: undefined,
      userStanzas: undefined,
      userFavoriteStanzas: undefined,
      allViewableStanzas: undefined,
      audios: undefined,
      userAudios: undefined,
      userFavoriteAudios: undefined,
      AllViewableAudios: undefined,
      isRefreshing: false,
    };
    if(this.state.favorites) {
      api.fetchUserFavorites(this.state.userId, (photos) => {
        var photosArr = JSON.parse(photos);
        this.setState({ userFavoritesUrls: photosArr });
      })
      api.fetchUserPhotos(this.state.userId, (photos) => {
        var photosArr = JSON.parse(photos);
        var photosUrls = photosArr.map((photo) => {
          return photo.url;
        });
        this.setState({ imageUrls: photosUrls });
        this.setState({ userPhotosUrls: photosUrls });
      })
      api.fetchUserFavoriteStanzas(this.state.userId, (stanzas) => {
        var stanzasArr = JSON.parse(stanzas);
        this.setState({ userFavoriteStanzas: stanzasArr });
      })
      api.fetchUserStanzas(this.state.userId, (stanzas) => {
        var stanzasArr = JSON.parse(stanzas);
        this.setState({ stanzas: stanzasArr });
        this.setState({ userStanzas: stanzasArr });
      })
      api.fetchUserFavoriteAudios(this.state.userId, (audios) => {
        var audiosArr = JSON.parse(audios);
        this.setState({ userFavoriteAudios: audiosArr });
      })
      api.fetchUserAudios(this.state.userId, (audios) => {
        var audiosArr = JSON.parse(audios);
        this.setState({ audios: audiosArr });
        this.setState({ userAudios: audiosArr });
      })
    } else {
      navigator.geolocation.getCurrentPosition(
        location => {
          this.setState({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      );
      api.fetchPhotos(this.state.latitude, this.state.longitude, 50, (photos) => { // need to pass in the radius (in m) from the MapView; hardcoding as 50m for now
        var photosArr = JSON.parse(photos);
        var photosUrls = photosArr.map((photo) => {
          return photo.url;
        });
        this.setState({ imageUrls: photosUrls });
      })
      api.fetchStanzas(this.state.latitude, this.state.longitude, 50, (stanzas) => { // need to pass in the radius (in m) from the MapView; hardcoding as 50m for now
        var stanzasArr = JSON.parse(stanzas);
        this.setState({ stanzas: stanzasArr });
      })
      api.fetchAudios(this.state.latitude, this.state.longitude, 50, (audios) => { // need to pass in the radius (in m) from the MapView; hardcoding as 50m for now
        var audiosArr = JSON.parse(audios);
        this.setState({ audios: audiosArr });
      })
    }
  }

  componentDidMount() {
    if(this.state.favorites){
      this.setState({ imageUrls: this.state.userPhotosUrls});
      this.setState({ stanzas: this.state.userStanzas});
      this.setState({ audios: this.state.userAudios});
    } else {
      this.setState({ imageUrls: this.state.allViewablePhotos});
      this.setState({ stanzas: this.state.allViewableStanzas});
      this.setState({ audios: this.state.allViewableAudios});
    }
  }

  componentWillUnmount() {
    if(this.state.previousComponent==='settings') {StatusBarIOS.setHidden(false);}
    if(this.state.previousComponent==='map') {StatusBarIOS.setHidden(true);}
  }

  handleRotation(event) {
    var layout = event.nativeEvent.layout;
    this.setState({ currentScreenWidth: layout.width, currentScreenHeight: layout.height });
  }

  calculatedSize() {
    var size = this.state.currentScreenWidth / IMAGES_PER_ROW;
    return { width: size, height: size };
  }

  // function that returns a function that knows the correct uri to render
  showImageFullscreen(uri, index) {
    return () => {
      this.setState({statusBarHidden: true});
      this.props.navigator.push({
        component: PhotoSwiperView,
        index: index,
        photos: this.state.imageUrls,
        // uri: uri,
        // width: this.state.currentScreenWidth,
        showStatusBar: this.showStatusBar.bind(this),
        userId: this.state.userId,
        sceneConfig: {
          ...Navigator.SceneConfigs.FloatFromBottom,
          gestures: {
            pop: {
              ...Navigator.SceneConfigs.FloatFromBottom.gestures.pop,
              edgeHitWidth: Dimensions.get('window').height,
            },
          },
        }
      });
    }
  }

  showStanzaFullscreen(stanza, index) {
    return () => {
      this.setState({statusBarHidden: true});
      this.props.navigator.push({
        component: StanzaSwiperView,
        index: index,
        stanzas: this.state.stanzas,
        // uri: uri,
        // width: this.state.currentScreenWidth,
        showStatusBar: this.showStatusBar.bind(this),
        userId: this.state.userId,
        sceneConfig: {
          ...Navigator.SceneConfigs.FloatFromBottom,
          gestures: {
            pop: {
              ...Navigator.SceneConfigs.FloatFromBottom.gestures.pop,
              edgeHitWidth: Dimensions.get('window').height,
            },
          },
        }
      });
    }
  }

  showAudioFullscreen(audio, index) {
    // return () => {
    //   this.setState({statusBarHidden: true});
    //   this.props.navigator.push({
    //     component: AudioSwiperView,
    //     index: index,
    //     audios: this.state.audios,
    //     // uri: uri,
    //     // width: this.state.currentScreenWidth,
    //     showStatusBar: this.showStatusBar.bind(this),
    //     userId: this.state.userId,
    //     sceneConfig: {
    //       ...Navigator.SceneConfigs.FloatFromBottom,
    //       gestures: {
    //         pop: {
    //           ...Navigator.SceneConfigs.FloatFromBottom.gestures.pop,
    //           edgeHitWidth: Dimensions.get('window').height,
    //         },
    //       },
    //     }
    //   });
    // }
  }

  showStatusBar() {
    this.setState({statusBarHidden: false});
  }

  renderRow(images) {
    return images.map((uri, index) => {
      return (
        // Hardcoded key value for each element below to dismiss eror message
        <TouchableHighlight onPress={this.showImageFullscreen(uri, index)}>
          <Image style={[styles.image, this.calculatedSize()]} source={{uri: uri}} />
        </TouchableHighlight>
      )
    })
  }

  renderStanzaRow(stanzas) {
    return stanzas.map((stanza, index) => {
        console.log('TRYNA RENDER A STANZA ROW!');
      return (
        // Hardcoded key value for each element below to dismiss eror message
        <TouchableHighlight onPress={this.showStanzaFullscreen(stanza, index)}>
          <Text style={[styles.stanza, this.calculatedSize()]}>{stanza.text}</Text>
        </TouchableHighlight>
      )
    })
  }

  _startPlay(filename) {
    return () => {
      AudioPlayer.playWithUrl('http://localhost:8000/' + filename);
    }
  }

  renderAudioRow(audios) {
    return audios.map((audio, index) => {
      return (
        // Hardcoded key value for each element below to dismiss eror message
        <TouchableHighlight onPress={this._startPlay(JSON.parse(audio.audio).filename)}>
          <Text style={[styles.stanza, this.calculatedSize()]}>AudioID: {audio._id}</Text>
        </TouchableHighlight>
      )
    })
  }

  _backButton() {
    this.props.navigator.pop();
  }

  _onChange(event) {
    this.setState({
      selectedIndex: event.nativeEvent.selectedSegmentIndex,
    });
    if(event.nativeEvent.selectedSegmentIndex===0) {
        this.setState({ imageUrls: this.state.userPhotosUrls});
        this.setState({ stanzas: this.state.userStanzas});
        this.setState({ audios: this.state.userAudios});
    } else if(event.nativeEvent.selectedSegmentIndex===1) {
        this.setState({ imageUrls: this.state.userFavoritesUrls});
        this.setState({ stanzas: this.state.userFavoriteStanzas});
        this.setState({ audios: this.state.userFavoriteAudios});
    }
  }

  _onRefresh() {
    this.setState({isRefreshing: true});
    if(this.state.favorites) {
      api.fetchUserFavorites(this.state.userId, (photos) => {
        var photosArr = JSON.parse(photos);
        this.setState({ userFavoritesUrls: photosArr });
      })
      api.fetchUserFavoriteStanzas(this.state.userId, (stanzas) => {
        var stanzaArr = JSON.parse(stanzas);
        this.setState({ userFavoriteStanzas: stanzaArr });
      })
      api.fetchUserFavoriteAudios(this.state.userId, (audios) => {
        var audioArr = JSON.parse(audios);
        this.setState({ userFavoriteAudios: audioArr });
      })
      api.fetchUserPhotos(this.state.userId, (photos) => {
        var photosArr = JSON.parse(photos);
        var photosUrls = photosArr.map((photo) => {
          return photo.url;
        });
        this.setState({ userPhotosUrls: photosUrls });
      })
      api.fetchUserStanzas(this.state.userId, (stanzas) => {
        var stanzaArr = JSON.parse(stanzas);
        this.setState({ userStanzas: stanzaArr });
      })
      api.fetchUserAudios(this.state.userId, (audios) => {
        var audioArr = JSON.parse(audios);
        this.setState({ userAudios: audioArr });
      })
      if(this.state.selectedIndex===0) {
        this.setState({imageUrls: this.state.userPhotosUrls});
        this.setState({stanzas: this.state.userStanzas});
        this.setState({audios: this.state.userAudios});
      } else if(this.state.selectedIndex===1) {
        this.setState({imageUrls: this.state.userFavoritesUrls});
        this.setState({stanzas: this.state.userFavoriteStanzas});
        this.setState({audios: this.state.userFavoriteAudios});
      }
    } else {
      navigator.geolocation.getCurrentPosition(
        location => {
          this.setState({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      );
      api.fetchPhotos(this.state.latitude, this.state.longitude, 50, (photos) => { // need to pass in the radius (in m) from the MapView; hardcoding as 50m for now
        var photosArr = JSON.parse(photos);
        var photosUrls = photosArr.map((photo) => {
          return photo.url;
        });
        this.setState({ imageUrls: photosUrls });
      })
      api.fetchStanzas(this.state.latitude, this.state.longitude, 50, (stanzas) => { // need to pass in the radius (in m) from the MapView; hardcoding as 50m for now
        var stanzaArr = JSON.parse(stanzas);
        this.setState({ stanzas: stanzaArr });
      })
      api.fetchAudios(this.state.latitude, this.state.longitude, 50, (audios) => { // need to pass in the radius (in m) from the MapView; hardcoding as 50m for now
        var audioArr = JSON.parse(audios);
        this.setState({ audios: audioArr });
      })
    }
    setTimeout(() => {
      this.setState({
        isRefreshing: false,
      });

    }, 1000);
  }

  render() {
    var pageTitle = (
       this.state.favorites ? <Text style={styles.pageTitle}>Your Media</Text> : <Text style={styles.pageTitle}>Media Near You</Text>
    )
    var backButton = (
      <TouchableHighlight onPress={this._backButton.bind(this)} underlayColor={'white'}>
        <IconIon name='ios-arrow-thin-down' size={30} style={styles.backIcon} color="#FF5A5F"/>
      </TouchableHighlight>
    );
    if(this.state.favorites) {
      return (
        <View style={{flex: 1, backgroundColor: '#ededed' }}>
          <NavigationBar
            title={pageTitle}
            tintColor={"white"}
            statusBar={{hidden: this.state.statusBarHidden}}
            leftButton={backButton}/>
          <SegmentedControlIOS
            values={['Uploaded By You', 'Favorited']}
            selectedIndex={this.state.selectedIndex}
            style={styles.segments}
            tintColor="#FF5A5F"
            onChange={this._onChange.bind(this)}/>

          <ScrollView refreshControl={
            <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={this._onRefresh.bind(this)}
                title="Refreshing..."
             />
           }>
            <View>
              <Text style={styles.mediaTitle}>Photos</Text>
              {this.state.imageUrls ? null : <ActivityIndicatorIOS size={'large'} style={[styles.centering, {height: 550}]} />}
              {this.state.imageUrls && this.state.selectedIndex===0 && !this.state.imageUrls.length ? <Text style={styles.noPhotosText}>Looks like you haven't taken any photos...</Text>   : null}
              {this.state.imageUrls && this.state.selectedIndex===0 && !this.state.imageUrls.length ? <Text style={styles.noPhotosText2}>Swipe to the camera and drop a photo!</Text>  : null}
              {this.state.imageUrls && this.state.selectedIndex===1 && !this.state.imageUrls.length ? <Text style={styles.noPhotosText}>Looks like you have no favorite photos...</Text>   : null}
              {this.state.imageUrls && this.state.selectedIndex===1 && !this.state.imageUrls.length ? <Text style={styles.noPhotosText2}>Swipe to the map and checkout media around you!</Text>  : null}
              <ScrollView horizontal={true}>
                {this.state.imageUrls ? this.renderRow(this.state.imageUrls) : null}
              </ScrollView>
            </View>

            <View>
              <Text style={styles.mediaTitle}>Stanzas</Text>
              {this.state.stanzas ? null : <ActivityIndicatorIOS size={'large'} style={[styles.centering, {height: 550}]} />}
              {this.state.stanzas && this.state.selectedIndex===0 && !this.state.stanzas.length ? <Text style={styles.noPhotosText}>Looks like you haven't written any stanzas...</Text>   : null}
              {this.state.stanzas && this.state.selectedIndex===0 && !this.state.stanzas.length ? <Text style={styles.noPhotosText2}>Swipe to the text input and drop a verse!</Text>  : null}
              {this.state.stanzas && this.state.selectedIndex===1 && !this.state.stanzas.length ? <Text style={styles.noPhotosText}>Looks like you have no favorite stanzas...</Text>   : null}
              {this.state.stanzas && this.state.selectedIndex===1 && !this.state.stanzas.length ? <Text style={styles.noPhotosText2}>Swipe to the map and checkout media around you!</Text>  : null}
              <ScrollView horizontal={true}>
                {this.state.stanzas ? this.renderStanzaRow(this.state.stanzas) : null}
              </ScrollView>
            </View>

            <View>
              <Text style={styles.mediaTitle}>Audio</Text>
              {this.state.audios ? null : <ActivityIndicatorIOS size={'large'} style={[styles.centering, {height: 550}]} />}
              {this.state.audios && this.state.selectedIndex===0 && !this.state.audios.length ? <Text style={styles.noPhotosText}>Looks like you haven't recorded anything...</Text>   : null}
              {this.state.audios && this.state.selectedIndex===0 && !this.state.audios.length ? <Text style={styles.noPhotosText2}>Swipe to the mic and record something!</Text>  : null}
              {this.state.audios && this.state.selectedIndex===1 && !this.state.audios.length ? <Text style={styles.noPhotosText}>Looks like you have no favorite audio clips...</Text>   : null}
              {this.state.audios && this.state.selectedIndex===1 && !this.state.audios.length ? <Text style={styles.noPhotosText2}>Swipe to the map and checkout media around you!</Text>  : null}
              <ScrollView horizontal={true}>
                {this.state.audios ? this.renderAudioRow(this.state.audios) : null}
              </ScrollView>
            </View>

          </ScrollView>

        </View>
      );
    } else {
      return (
        <View style={{flex: 1, backgroundColor: '#ededed' }}>
          <NavigationBar
            title={pageTitle}
            tintColor={"white"}
            statusBar={{hidden: this.state.statusBarHidden}}
            leftButton={backButton}/>



            <View>
              <Text style={styles.mediaTitle}>Photos</Text>
              {this.state.imageUrls ? null : <ActivityIndicatorIOS size={'large'} style={[styles.centering, {height: 550}]} />}
              {this.state.imageUrls && !this.state.imageUrls.length  ? <Text style={styles.noPhotosText}>Looks like there are no photos near you...</Text>   : null}
              {this.state.imageUrls && !this.state.imageUrls.length  ? <Text style={styles.noPhotosText2}>Be the first one to drop a photo!</Text>  : null}
              <ScrollView horizontal={true}>
                {this.state.imageUrls ? this.renderRow(this.state.imageUrls) : null}
              </ScrollView>
            </View>

            <View>
              <Text style={styles.mediaTitle}>Stanzas</Text>
              {this.state.stanzas ? null : <ActivityIndicatorIOS size={'large'} style={[styles.centering, {height: 550}]} />}
              {this.state.stanzas && this.state.selectedIndex===0 && !this.state.stanzas.length ? <Text style={styles.noPhotosText}>Looks like there are no stanzas near you...</Text>   : null}
              {this.state.stanzas && this.state.selectedIndex===0 && !this.state.stanzas.length ? <Text style={styles.noPhotosText2}>Be the first one to drop a verse!</Text>  : null}
              <ScrollView horizontal={true}>
                {this.state.stanzas ? this.renderStanzaRow(this.state.stanzas) : null}
              </ScrollView>
            </View>

            <View>
              <Text style={styles.mediaTitle}>Audio</Text>
              {this.state.audios ? null : <ActivityIndicatorIOS size={'large'} style={[styles.centering, {height: 550}]} />}
              {this.state.audios && this.state.selectedIndex===0 && !this.state.audios.length ? <Text style={styles.noPhotosText}>Looks like there's no audio near you...</Text>   : null}
              {this.state.audios && this.state.selectedIndex===0 && !this.state.audios.length ? <Text style={styles.noPhotosText2}>Be the first one to record something!</Text>  : null}
              <ScrollView horizontal={true}>
                {this.state.audios ? this.renderAudioRow(this.state.audios) : null}
              </ScrollView>
            </View>

        </View>
      );
    }
  }
}

var styles = StyleSheet.create({
  centering: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  noPhotosText: {
    marginTop: 65,
    fontSize: 16,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#656565',
    fontFamily: 'circular'
  },
  noPhotosText2: {
    fontSize: 16,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#656565',
    fontFamily: 'circular'
  },
  scrollView: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  image: {
    borderWidth: 1,
    borderColor: '#fff'
  },
  backIcon: {
    marginLeft: 15,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'circular',
    textAlign: 'center',
    color: '#565b5c'
  },
  stanza: {
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#c4e1ea',
    padding: 5,
  },
  mediaTitle: {
    fontSize: 18,
    fontFamily: 'circular',
    padding: 10
  }
});

module.exports = PhotosView;

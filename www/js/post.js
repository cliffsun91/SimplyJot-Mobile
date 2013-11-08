function Post() {
  var id;
  var postContent;
  var timePosted;
  var synced = false;
  var equals = function(other) {
    return other.id === this.id && 
           other.postContent === this.postContent &&
           other.timePosted === this.timePosted;
  };
}
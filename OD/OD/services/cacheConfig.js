/**
 * Created by rbailey on 08/01/14.
 */

exports.cacheConfig = {
//    archiveFeed_CacheControl: 'public, max-age=31536000',   // Cache for 12 months, as will never change!
    archiveFeed_CacheControl: 'public, max-age=120',   // Cache for 12 months, as will never change!

    recentFeed_CacheControl: 'public, max-age=120'          // Cache for 2 mins before checking again (and then use ETag)
};



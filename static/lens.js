$(function(){
    // Create map panel on the right
    clicking     = false,
    dragging     = false,
    click_offset = undefined,

    // Various reddit DOM elements
    Reddit = {
        dom : {
            content  : undefined,
            comments : undefined
        },
        init : function() {
            this.content  = $('.commentarea').children('.sitetable');
            this.comments = this.content.children('.comment');
        }
    },

    Lens = {
        opts : {
            map_scale: 0.1
        },

        dom : {
            lens_wrapper : $( document.createElement('div')).addClass('reddit-map-lens-wrapper'),
            lens         : $( document.createElement('div')).addClass('reddit-map-lens'),
        },

        init : function() {
            var that = this,
                lens = this.dom.lens;

            this.dom.lens.mousedown( function(e){
                clicking = true;
                click_offset = e.clientY-lens.position().top;
                lens.addClass( 'grabbing' );
                $(document).disableSelection();
                
            }).mouseup( function(){
                clicking = false;
                lens.removeClass( 'grabbing' );
                $(document).enableSelection();

            }).mousemove( function(e){
                e.preventDefault();
                if ( !clicking ) return;

                var lens_offset   = lens.offset(),
                    lens_pos = lens.position();

                dragging = true;
                // don't let the lens move beyond screen bounds
                if ( lens_pos.top < 0 || lens_pos.top > $(window).height() )
                    return false;

                // Cancel dragging outside the document window
                if ( lens_offset.left > $(document).width() || 
                    lens_pos.top > $(document).height() ) {
                    dragging = false;
                    return false;
                }

                var offset_top = Math.max( e.clientY - click_offset, 0 );
                
                if ( offset_top < 0 )
                    return;

                lens.css( 'top', offset_top );
            });

            this.resize_lens();

            this.dom.lens.bind( 'drag', function lens_drag_handler(e,ui) {
                dragging = true;
            });

            //setInterval( function(){ lens_move_handler() }, 20 );
            setInterval( function(){ that.lens_scroll_handler() }, 50 );

            this.dom.lens_wrapper.append( this.dom.lens );
            this.dom.lens_wrapper.insertBefore( $(document.body).children().eq(0) );
        },

        // Scroll document if user moves lens
        lens_move_handler : function() {
            if ( dragging ) {
                dragging = false;
                var lens_pos = lens.position(),
                    pos = lens_pos.top  * Math.floor( 
                            ( $(document).height() / ($(window).height() - lens.height()) ) );

                window.scrollTo( 0, pos );
            }
        },

        // Resize lens based on window height
        resize_lens : function(e){
            var lens_height = Math.floor( $(window).height() * 
                                 ( Map.dom.content.height() / Reddit.content.height() ) );
            this.dom.lens.height( lens_height );
        },
        
        // Move lens as document scrolls
        lens_scroll_handler : function() {
            if ( dragging ) return;
            var lens_top = Math.floor( window.pageYOffset * 
                          ( ($(window).height() - this.dom.lens.height()) / Reddit.content.height() ) );
            this.dom.lens.css( 'top', lens_top );
        }
        
    },

    Map = {
        dom : {
            map     : $( document.createElement('div')).prop('id', 'reddit-map'),
            content : $( document.createElement('div')).addClass('reddit-map-content')
        },

        init : function() { 
            var that = this;
            this.dom.map.append( this.dom.content );
            this.dom.map.insertBefore( $(document.body).children().eq(0));
            this.generate_map( this.dom.content, Reddit.comments );
            setInterval( function(){ 
                that.scroll_map() 
            }, 20 );
        },

        generate_map : function( content, comments ) {
            // Create spacers for header and footer
            var header = $( document.createElement('div') ).addClass('reddit-map-spacer'),
                footer = header.clone()
                map_scale = Lens.opts.map_scale,
                header_height = $('#header').height() + 
                    $('.sitetable.linklisting').height() +
                    $('.panestack-title').height() + $('.menuarea').height() +
                    $('.usertext.cloneable').height();

            header.css( 'height', Math.floor( header_height * map_scale  ) );
            footer.css( 'height', Math.floor( $('.footer-parent').height() * map_scale ) );

            this.dom.content.append( header );
            this.generate_comments( content, comments );
            this.dom.content.append( footer );
        },//}}}

        // Walk through all the comments creating a map based on
        // each comment's height and descendants
        generate_comments : function( parent, nodes ) {
            var that = this;

            $.each( nodes, function(){
                var $node = $(this),
                    map_scale = Lens.opts.map_scale,
                    comment_text = $node.children('.entry').find('.usertext-body'),
                    comment_children = $node.children('.child').children('.sitetable').children('.comment'),
                    comment  = $( document.createElement('div')).addClass('reddit-map-comment'),
                    element  = $( document.createElement('div')).addClass('reddit-map-comment-element'), 
                    children = $( document.createElement('div')).addClass('reddit-map-comment-children');

                // Set map elements' height to match with global height ratio
                var elm_height = comment_text.height();
                element.height( Math.floor( map_scale * elm_height ) );

                comment.append( element ).append( children );
                // keep track of the original DOM node for the comment
                comment.data( 'parent_comment', this );

                // hightlight comment
                element.hover( function(e) {
                    comment_text.css( 'background', '#faa' );
                }, function(e) {
                    comment_text.css( 'background', '#fff' );
                });

                parent.append( comment );

                // recurse on the comment's children
                if( comment_children.length != 0 ) {
                    that.generate_comments( children, comment_children );
                }

            });
        },

        // Scroll map proportionally with the document
        scroll_map : function() {
            if ( !Debug.scroll_map ) return;
            var lens_ratio = 
                ( this.dom.content.height() - $(window).height() ) / 
                    Reddit.content.height(),

                offset     = Math.floor( window.pageYOffset * lens_ratio );

            this.dom.content.css( 'margin-top', -offset );
        }

    },

    // Various parameters useful for debugging
    Debug = { 
        scroll_map: true
    },

    // Vroom!
    Reddit.init();
    Map.init();
    Lens.init();

    window.reddit_map = {
        map: Map,
        lens: Lens,
        debug: Debug
    };

});


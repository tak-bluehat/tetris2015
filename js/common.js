var tetrisApp = function(){
	var that = {};


	var component = null;
	var type_to_color = {
		'I': 'skyblue',
		'O': 'yellow',
		'S': 'green',
		'Z': 'red',
		'J': 'blue',
		'L': 'orange',
		'T': 'pink',
		'none': 'none'
	};

	var activeBlock = null;
	var game_timer = null;

	var checkBlocks = function(){
		var base_data = component.state.data;
		var count = 0;
		$.each( base_data, function( index, block ){
			if( block.active === false && block.mino === true ){
				count++;
			}
			if( count === 10 ){
				clearBlocks( index );	
			}
			if( index !== 0 && ( index + 1 ) % 10 === 0 ){
				count = 0;
			}
		});
	};

	var clearBlocks = function( start_index ){
		var base_data = component.state.data;
		for( var index = start_index; index > 9; index-- ){
			if( base_data[ index - 10 ].active === false ){
				var migrate_object = base_data[ index - 10 ];
				base_data[ index ].active = migrate_object.active;
				base_data[ index ].mino = migrate_object.mino;
				base_data[ index ].type = migrate_object.type;
			}
		}
		component.setState({ data: base_data });
	};

	var activeBlockObject = function(){
		var block = {};
		var lock = false;
		var index_codes = [
			{},
			{},
			{},
			{}
		];
		var down_timer = null;
		var max_left = 10;
		var max_right = 0;
		var max_bottom = 0;

		var init = function(){
			var base_data = component.state.data;
			var type_object = getType();
			$.each( type_object.code, function( index, value ){
				var data_index = value.row * 10 + value.col;
				base_data[ data_index ] = {
					id: data_index,
					active: true,
					mino: true,
					type: type_object.type
				};
				index_codes[ index ].row = value.row;
				index_codes[ index ].col = value.col;
				index_codes[ index ].type = type_object.type;
			});
			component.setState({ data: base_data });
			down_timer = setInterval( function(){
				down();
			}, 1000 );
			bindKey();
		};

		var bindKey = function(){
			$( document ).keydown( function( e ){
				if( e.which === 37 ){
					move( 'left' );
				}else if( e.which === 39 ){
					move( 'right' );
				}else if( e.which === 40 ){
					move( 'down' );
				}else if( e.which === 32 ){
					rotate();
				}
			});		
		};

		var unBindKey = function(){
			$( document ).unbind();
		};

		var getType = function(){
			
			var type = ['I', 'O', 'S', 'Z', 'J', 'L', 'T'];
			var tetrimino_code = {
				'I': [
					{ row: 2, col: 3 },
					{ row: 2, col: 4 },
					{ row: 2, col: 5 },
					{ row: 2, col: 6 }
				],
				'O': [
					{ row: 2, col: 4 },
					{ row: 2, col: 5 },
					{ row: 3, col: 4 },
					{ row: 3, col: 5 }
				],
				'S': [
					{ row: 2, col: 5 },
					{ row: 2, col: 6 },
					{ row: 3, col: 5 },
					{ row: 3, col: 4 }
				],
				'Z': [
					{ row: 2, col: 4 },
					{ row: 2, col: 5 },
					{ row: 3, col: 5 },
					{ row: 3, col: 6 }
				],
				'J': [
					{ row: 2, col: 3 },
					{ row: 3, col: 3 },
					{ row: 3, col: 4 },
					{ row: 3, col: 5 }
				],
				'L': [
					{ row: 2, col: 5 },
					{ row: 3, col: 3 },
					{ row: 3, col: 4 },
					{ row: 3, col: 5 }
				],
				'T': [
					{ row: 2, col: 4 },
					{ row: 3, col: 3 },
					{ row: 3, col: 4 },
					{ row: 3, col: 5 }
				]
			};
		
			var get_random_int = function(start, end){
				var result = start + Math.floor( Math.random() * ((end - start) + 1));
			return result;
			};

			var initType = type[ get_random_int( 0, 6 ) ];

			return { 
				type: initType,
				code: tetrimino_code[ initType ]
			}
		};

		var down = function(){
		
			if( detectCollision( 'down' ) === true ){
				return;
			}
		
			mapToData( 'down' );	
		};

		var move = function( direction ){
			if( direction === 'down' ){
				down();
				return;
			}
			if( detectCollision( direction ) === true ){
				return;
			}
			if( direction === 'left' && max_left <= 0 ){
				return;
			}
			if( direction === 'right' && max_right >= 9 ){
				return;
			}

			mapToData( direction );	
		};

		var rotate = function(){
			var base_index = 2;
			var base_block = index_codes[ base_index ];
			var base_data = component.state.data;
		
			if( lock === true ){
				return;
			}else{
				lock = true;
			}

			var de_codes = [
				{},
				{},
				{},
				{}	
			];
			// de_codes set
			$.each( index_codes, function( index, value ){
				var dx = value.col - base_block.col;
				var dy = value.row - base_block.row;
				var radian = Math.atan2( dy, dx );
				var angle = radian * 180 / Math.PI;
				var vector = Math.sqrt( Math.pow( dy, 2 ) + Math.pow( dx, 2 ) );
				var add_radian = ( angle + 90 ) * Math.PI / 180;
				var row = base_block.row + vector * Math.sin( add_radian );
				var col = base_block.col + vector * Math.cos( add_radian );
				de_codes[ index ].row = row;
				de_codes[ index ].col = col;
				de_codes[ index ].type = value.type;
			});
			// check de_codes
			var check_result = true;
			$.each( de_codes, function( index, value ){
				var data_index = value.row * 10 + value.col;
				if( value.row < 0 || value.row > 19 || value.col < 0 || value.col > 9 ){
					check_result = false;
					return false;
				}
				if( base_data[ data_index ].active === false && base_data[ data_index ].mino === true && base_data[ data_index ].type !== 'none' ){
					check_result = false;
					return false;
				}
			});
			if( check_result === false ){
				lock = false;
				return;
			}
			// mapToData
			max_left = 9;
			max_right = 0;
			var de_indexes = [];
			$.each( de_codes, function( index, value ){
				var de_index = value.row * 10 + value.col;
				base_data[ de_index ] = {
					id: de_index,
					active: true,
					mino: true,
					type: value.type
				};
				de_indexes.push( de_index );
			});
			$.each( index_codes, function( index, value ){
				var pre_index = value.row * 10 + value.col;
				if( $.inArray( pre_index, de_indexes ) === -1 ){
					base_data[ pre_index ] = {
						id: pre_index,
						active: false,
						mino: false,
						type: 'none'
					};
				}
				var new_row = de_codes[ index ].row;
				var new_col = de_codes[ index ].col;
				index_codes[ index ].row = new_row;
				index_codes[ index ].col = new_col;
				if( max_bottom < new_row ){
					max_bottom = new_row;
				}
				if( max_left > new_col ){
					max_left = new_col;
				}
				if( max_right < new_col ){
					max_right = new_col;
				}
			});
			component.setState({ data: base_data });
			lock = false;
		};

		var mapToData = function( direction ){

			if( lock === true ){
				return;
			}else{
				lock = true;
			}

			var base_data = component.state.data;
			var de_indexes = [];
			var row_diff = 0;
			var col_diff = 0;
			max_left = 9;
			max_right = 0;

			if( direction === 'down' ){
				row_diff = 1;
			}else if( direction === 'left' ){
				col_diff = -1;
			}else if( direction === 'right' ){
				col_diff = 1;
			}
	
			$.each( index_codes, function( index, value ){
				var de_index = ( value.row + row_diff ) * 10 + value.col + col_diff;
				base_data[ de_index ] = {
					id: de_index,
					active: true,
					mino: true,
					type: value.type
				};
				de_indexes.push( de_index );
			});
			$.each( index_codes, function( index, value ){
				var pre_index = value.row * 10 + value.col;
				if( $.inArray( pre_index, de_indexes ) === -1 ){
					base_data[ pre_index ] = {
						id: pre_index,
						active: false,
						mino: false,
						type: 'none'
					};
				}
				index_codes[ index ].row = value.row + row_diff;
				index_codes[ index ].col = value.col + col_diff;
				if( max_bottom < value.row ){
					max_bottom = value.row;
				}
				if( max_left > value.col ){
					max_left = value.col;
				}
				if( max_right < value.col ){
					max_right = value.col;
				}
			});
			component.setState({ data: base_data });
			lock = false;
		};
		

		var detectCollision = function( direction ){
			var base_data = component.state.data;
			if( max_bottom >= 19 ){
				deactive();
				return true;
			}
			var diff_row = 0;
			var diff_col = 0;
			if( direction === 'down' ){
				diff_row = 1;
			}else{
				if( ( direction === 'left' &&  max_left <= 0  ) || ( direction === 'right' &&  max_right >= 9 ) ){
					return true;
				}
			 	if( direction === 'left' ){
					diff_col = -1;
				}else if( direction === 'right' ){
					diff_col = 1;
				}
			}
			
			var block_collision_result = false;
			$.each( index_codes, function( index, value ){
				var de_index = ( value.row + diff_row ) * 10 + value.col + diff_col;
				var target_object = base_data[ de_index ];
 				if( target_object.active === false && target_object.mino === true && target_object.type !== 'none' ){
					block_collision_result = true;
					return false;
				}
			});
			if( block_collision_result === true ){
				deactive();
				return true;
			}
			return false;
		};
		
		var deactive = function(){
			var base_data = component.state.data;
			$.each( index_codes, function( index, value ){
				var data_index = value.row * 10 + value.col;		
				base_data[ data_index ] = {
					id: data_index,
					active: false,
					mino: true,
					type: value.type
				};
			});
			component.setState({ data: base_data });
			clearInterval( down_timer );
			unBindKey();

			
			// re-init
			activeBlock = activeBlockObject();
			activeBlock.init();
		};


		block.init = init;

		return block;
	};

	var Block = React.createClass({
		render: function(){
			var mino = this.props.data.mino;
			var type = this.props.data.type;
			var color = type_to_color[ type ];
			var top = Math.floor( this.props.data.id / 10 ) * 20;
			var left = this.props.data.id % 10 * 20;
			var block_style = {
				'top': top + 'px',
				'left': left + 'px'
			};
			var classes = 'block ' + color;
			return (
				<span className={classes} style={block_style} />
			);
		}
	});

	var BlockArea = React.createClass({
		render: function(){
			var blocks = this.props.data.map( function( block ){
				return (
					<Block key={block.id} data={block} />
				);
			});
			return (
				<div className="innerBoard">
					{blocks}
				</div>
			);
		}
	});

	var GameBoard = React.createClass({
		getInitialState: function(){
			var lists = [];
			for( var row = 0; row < 20; row++ ){
				for( var col = 0; col < 10; col++ ){
					var index = ( row * 10 ) + col;
					var list = {
						id: index,
						active: false,
						mino: false,
						type: 'none'
					};
					lists.push( list );
				}
			}
			return { data: lists };
		},
		render: function(){
			return (
				<BlockArea data={this.state.data} />
			);
		}
	});

	var init = function(){
		component = ReactDOM.render(
			<GameBoard />,
			document.getElementById('board')
		);
		activeBlock = activeBlockObject();
		activeBlock.init();
		setInterval( function(){
			checkBlocks();
		}, 1000 );
	};


	that.init = init;

	return that;
};

var app = tetrisApp();
app.init();

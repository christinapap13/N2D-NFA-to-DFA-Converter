class UserInput {
  constructor(initialState, finalStates, states, alphabet, transitions) {
    this.initialState = initialState;
    this.finalStates = finalStates;
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
  }
}

$(document).ready(function () {
	const toggleButton = document.getElementsByClassName('toggle-button')[0];
	const navbarLinks = document.getElementsByClassName('navbar-links')[0];

	toggleButton.addEventListener('click', () => {
		navbarLinks.classList.toggle('active')
	});

	let showForm = false;
	
	$("#new-transition").click(function () {
		
		if (!showForm){
			showForm = true;
			$(".production-row").show();
		} else {
			let transitionsDiv = $("#nfa-transitions");
			let clone = $("#nfa-transitions .production-row").last().clone(true);
			clone.val("");
			clone.find("input").each(function(){
				$(this).val("");
			});

			clone.appendTo(transitionsDiv);

			$(".remove-button").show();
		}
	});
	
	let removeButton = $(".remove-button");

	// Hide all remove buttons initially
	removeButton.hide();
	// Register onClick() event for remove buttons
	removeButton.click(function () {
		let parent = $(this).parent();
		let grandparent = parent.parent();

		parent.fadeOut(function () {
			$(this).remove();
			//$("#visualization").click();
		});

		if (grandparent.children().length <= 2) {
			$(".remove-button").hide();
		}
	});
	
	$(".production-row input").on("keypress", function (e) {
		if (e.which === 13) {
			$("#new-transition").click();
		}
	});
	
	$("#resetBtn").click(function () {
		$("#initialStateInput").val("");
		$("#finalStatesInput").val("");
		$("#alphabet").val("");
		$(".remove-button").slice(1).click();
		$(".remove-button").hide();
		$("#nfa-transitions input").val("");
		$("#current-nfa").empty();
		$("#current-dfa").empty();
		$("#details").empty();
		$("#Next").hide();
		$("#Previous").hide();
		$(".production-row").hide();
		showForm = false;
	});
	
	//verify-update-debug
	$("#visualization").click(function() {
		let user_input = fetchUserInput();
		console.log(user_input.transitions);
		user_input.transitions = [...new Set(user_input.transitions.map(a => JSON.stringify(a)))].map(a => JSON.parse(a));
		console.log(user_input.transitions);

		let dotStr = "digraph fsm {\n";
		dotStr += "rankdir=LR\n";
		dotStr += 'size="8,5"\n';
		dotStr += "fake [style = invisible];\n";

		if (!user_input.finalStates.includes(user_input.initialState)){
			dotStr += "node [shape = doublecircle]; " + user_input.finalStates + "\n";
			dotStr += "node [shape = circle];\n";
		} else{
			dotStr += "node [shape = doublecircle]; " + user_input.initialState + ";\n";
			dotStr += "node [shape = doublecircle]; " + user_input.finalStates + "\n";
			dotStr += "node [shape = circle];\n";
		}
		
		dotStr += "fake -> " + user_input.initialState + ";\n";

		if(user_input.transitions.length) {
			
			for (let i=0; i<user_input.transitions.length; i++) {
				let t = user_input.transitions[i];
					
				dotStr += 
					"" +
					t.state +
					" -> " +
					t.nextStates +
					" [label=" +
					t.symbol +
					"];\n";
			}
		}

		dotStr += "}";
		
		//console.log(dotStr);
		$("#current-nfa").show();
		d3.select("#current-nfa").graphviz().zoom(false).renderDot(dotStr);

		//$("#download-nfa").show();
		
		let dfa = generateDFA (new NFA(user_input.initialState, user_input.finalStates, user_input.states, user_input.alphabet, user_input.transitions));		
		dotStr = dfa.toDotString();
		//console.log(dotStr);
		d3.select("#current-dfa").graphviz().zoom(false).renderDot(dotStr);

		/*$("#download-current-dfa").show();

		$("#show-details").show();*/
		$("#details").empty();
		$("#Next").hide();
		$("#Previous").hide();
	});
		
	$("#download-nfa").on('click', function (){
		html2canvas(document.getElementById("current-nfa")).then(function (canvas) {
		  var container = document.createElement("a");
		  document.body.appendChild(container);
		  container.download = "NFA.jpg";
		  container.href = canvas.toDataURL();
		  container.target = '_blank';
		  container.click();
		});
	});
	
	$("#download-current-dfa").on('click', function (){
		html2canvas(document.getElementById("current-dfa")).then(function (canvas) {
			var container = document.createElement("a");
			document.body.appendChild(container);
			container.download = "Equivalent-DFA.jpg";
			container.href = canvas.toDataURL();
			container.target = '_blank';
			container.click();
		});
	});
	
	/*$("#show-details").on('click', function() { //For the animation!
		let sub_graph = [];
		let animation = [];
		let user_input = fetchUserInput();
		//Remove duplicates:
		user_input.transitions = [...new Set(user_input.transitions.map(a => JSON.stringify(a)))].map(a => JSON.parse(a));
		
		let dfa = generateDFA (
			new NFA(
				user_input.initialState, 
				user_input.finalStates, 
				user_input.states, 
				user_input.alphabet, 
				user_input.transitions
			)
		);
		
		// code for transitions so that the TRAP goes at the end!!
		let traptran = [];
		
		for (let j=0; j<dfa.transitions.length; j++) {
			let tran = dfa.transitions[j];
			
			if (tran.state === "TRAP") {
				traptran.push(tran);
			}
		}
		
		dfa.transitions = dfa.transitions.filter(element => {
			return element.state !== "TRAP";
		});
		
		dfa.transitions = dfa.transitions.concat(traptran);
		console.log(dfa.transitions);
		//-------------------------------------------------------------

		let dotStr = " digraph fsm { \n ";
		dotStr += " rankdir=LR; \n ";
		dotStr += ' size="8,5"; \n ';
		dotStr += " fake [style = invisible]; \n ";
		
		dotStr += " node [shape = circle]; \n ";
		dotStr += " fake -> " + dfa.formatDotState(dfa.initialState) + " \n ";
		
		sub_graph = (dotStr+" }").split("\n");
		
		animation.push(sub_graph);
		//console.log(animation);
		
		if(dfa.transitions.length) {
			for (let i=0; i<dfa.transitions.length; i++) {
				let t = dfa.transitions[i];
				
				dotStr +=
					" " +
					dfa.formatDotState(t.state) +
					" -> " +
					dfa.formatDotState(t.nextStates) +
					" [label= " +
					t.symbol +
					" ]\n";
				
				sub_graph = (dotStr+" }").split("\n");
				animation.push(sub_graph);
			}
		}
		//console.log(animation);
		
		let str = dfa.toDotString();
		sub_graph = str.split("\n");
		animation.push(sub_graph);
		console.log(animation);
		
		//Here for the animation code 
		let animationIndex = 0;
		var graphviz = d3.select("#details").graphviz().transition(function() {return d3.transition("main").ease(d3.easeLinear).delay(1500).duration(1500);}).logEvents(true).on("initEnd", render);
		
		function render() {
			if(animationIndex=== animation.length){
				return;
				graphviz = undefined;
				delete(graphviz);
			}
			var animationLines = animation[animationIndex];
			var animate = animationLines.join('');
			graphviz
				.renderDot(animate)
				.on("end", function() {
					//animationIndex = (animationIndex + 1) % animation.length;
					animationIndex = (animationIndex + 1);
					render();
				});
		}
	});*/

	$("#show-details").on('click', function() { // with steps!
		let sub_graphs = [];
		let user_input = fetchUserInput();
		//Remove duplicates:
		user_input.transitions = [...new Set(user_input.transitions.map(a => JSON.stringify(a)))].map(a => JSON.parse(a));
		
		let dfa = generateDFA (
			new NFA(
				user_input.initialState, 
				user_input.finalStates, 
				user_input.states, 
				user_input.alphabet, 
				user_input.transitions
			)
		);
		
		// TRAP transitions go at the end of the transitions array
		let traptran = [];
		
		for (let j=0; j<dfa.transitions.length; j++) {
			let tran = dfa.transitions[j];
			
			if (tran.state === "TRAP") {
				traptran.push(tran);
			}
		}
		
		dfa.transitions = dfa.transitions.filter(element => {
			return element.state !== "TRAP";
		});
		
		dfa.transitions = dfa.transitions.concat(traptran);
		console.log(dfa.transitions);
		//-----------------------------------------------------------------------

		let dotStr = " digraph fsm { \n ";
		dotStr += " rankdir=LR \n ";
		dotStr += ' size="8,5" \n ';
		dotStr += " fake [style = invisible]; \n ";
		
		dotStr += " node [shape = circle]; \n ";
		dotStr += " fake -> " + dfa.formatDotState(dfa.initialState) + " \n ";
		
		sub_graphs.push(dotStr+"}");
		
		if(dfa.transitions.length) {
			for (let i=0; i<dfa.transitions.length; i++) {
				let t = dfa.transitions[i];
				
				dotStr +=
					" " +
					dfa.formatDotState(t.state) +
					" -> " +
					dfa.formatDotState(t.nextStates) +
					" [label= " +
					t.symbol +
					" ] \n";
				
				sub_graphs.push(dotStr+ "}");
			}
		}
		
		let str = dfa.toDotString();
		sub_graphs.push(str);
		//console.log(sub_graphs);
		
		let index = 0;
		
		
		let graph = sub_graphs[0];
		d3.select("#details").graphviz().zoom(false).renderDot(graph);
		
		$("#Next").show();
		$("#Previous").show();
		
		$("#Next").on('click', function() {
			index++;
			if (index === sub_graphs.length) {index = sub_graphs.length-1;}
			graph = sub_graphs[index];
			d3.select("#details").graphviz().zoom(false).renderDot(graph);
		});

		$("#Previous").on('click', function() {
			index--;
			if(index<0) {index = 0;}
			graph = sub_graphs[index];
			d3.select("#details").graphviz().zoom(false).renderDot(graph);
		});
		
	});
	
	
	function fetchUserInput() {
		let initialState = $("#initialStateInput").val().trim();
		let finalStates = $("#finalStatesInput").val().trim().replace(/\s+/g, '');
		let states = [];
		let alphabet = $("#alphabet").val().trim().replace(/\s+/g, '');
		let transitions = [];

		if (initialState.includes("{") || finalStates.includes("{")) {
		  alert('State names cannot contain the "{" character!');
		  return null;
		}

		if(alphabet.includes(",")) alphabet = alphabet.split(",");
		
		if(showForm){
			$(".production-row").each(function () {
			  let currentState = $(this).find(".current-state-input").val().trim();
			  let inputSymbol = $(this).find(".input-symbol").val().trim();

			  if (inputSymbol === "") inputSymbol = "\u03B5"; //epsilon character

			  let nextState = $(this).find(".next-states").val().trim().replace(/\s+/g, '');

			  //Better state validation?
			  if (currentState.includes("{") || nextState.includes("{")) {
				alert('State names cannot contain the "{" character!');
				return;
			  }
			  
			  if (nextState.includes(",")) nextState = nextState.split(",");
			  
			  if(inputSymbol !== "\u03B5" && !alphabet.includes(inputSymbol)){
			  	alert('One or more of the given symbols is not the alphabet!');
				return;
			  }

			  transitions.push(new Transition(currentState, nextState, inputSymbol));

			  // Populate alphabet without epsilon
			  /*if (inputSymbol !== "\u03B5" && !alphabet.includes(inputSymbol))
				alphabet.push(inputSymbol);*/

			  if (!states.includes(currentState)) states.push(currentState);

			  if (!states.includes(nextState)) states.push(nextState);
			});
		}

		if (finalStates.includes(",")) finalStates = finalStates.split(",");

		return new UserInput(
		  initialState,
		  finalStates,
		  states,
		  alphabet,
		  transitions
		);
		
	}
});
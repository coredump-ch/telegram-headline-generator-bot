<?php
	header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang='de' manifest='cachemanifest.php'>
	<meta charset='utf-8'>
	<title>Headline Generator</title>
	<style>
		@-webkit-keyframes loading {
			0% {
				-webkit-transform: rotate(45deg) scaleX(1);
				transform: rotate(45deg) scaleX(1);
			}
			4% {
				-webkit-transform: rotate(45deg) scaleX(-1);
				transform: rotate(45deg) scaleX(-1);
			}
			50% {
				-webkit-transform: rotate(135deg) scaleX(-1);
				transform: rotate(135deg) scaleX(-1);
			}
			54% {
				-webkit-transform: rotate(135deg) scaleX(1);
				transform: rotate(135deg) scaleX(1);
			}
			100% {
				-webkit-transform: rotate(225deg) scaleX(1);
				transform: rotate(225deg) scaleX(1);
			}
		}

		@keyframes loading {
			0% {
				-ms-transform: rotate(45deg) scaleX(1);
				transform: rotate(45deg) scaleX(1);
			}
			4% {
				-ms-transform: rotate(45deg) scaleX(-1);
				transform: rotate(45deg) scaleX(-1);
			}
			50% {
				-ms-transform: rotate(135deg) scaleX(-1);
				transform: rotate(135deg) scaleX(-1);
			}
			54% {
				-ms-transform: rotate(135deg) scaleX(1);
				transform: rotate(135deg) scaleX(1);
			}
			100% {
				-ms-transform: rotate(225deg) scaleX(1);
				transform: rotate(225deg) scaleX(1);
			}
		}

		body {
			padding: 5em 15%;
			font-family: sans-serif;
		}
	
		h2 {
			font-size: 1.5em;
			margin: 0;
		}
	
		h3 {
			color: #d2008c;
			font-size: .75em;
			margin: 0;
		}
	
		hgroup {
			margin-bottom: 2em;
		}
	
		p {
			color: #aaa;
			margin-top: 5em;
		}

		#headlines.loading {
			background-color: #d2008c;
			max-width: 3em;
			max-height: 3em;
			min-width: 3em;
			min-height: 3em;
			margin: 0 auto;
			-webkit-animation: loading 6s infinite linear;
			animation: loading 6s linear infinite;
		}
		
		.hidden {
			display: inline-block;
			width: 0.1px;
			overflow: hidden;
		}
	</style>
	<h1 hidden>Headline Generator</h1>
	<script src="scripts.js"></script>
	<div id=headlines class=loading></div>
	<p>Headline Generator nimmt die Schlagzeilen einer Schweizer Abendzeitung und analysiert sie per Markov-Chain (für jedes Wort und jede Wortgruppe wird die Wahrscheinlichkeit berechnet, welche Wörter anschliessend folgen können) um so neue Schlagzeilen zu erzeugen. Dadurch entsteht viel Unsinn, aber manchmal … :-) Übrigens kam keine Schlagzeile so in der Zeitung vor – das wird auch geprüft.</p>
</html>
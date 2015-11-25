<?php

function tokenIsAllowed($token, $hadPart2) {
	if ($hadPart2 && $token == 'PART2') {
		return false;
	}
	if (!$hadPart2 && $token == 'EOF') {
		return false;
	}
	return true;
}

function getFollowerCollection($currentFollowers, $index, $multiplicity, $noEOF) {
	$singleTokensLength = count($currentFollowers[0]);
	$collection = array();
	if (count($currentFollowers[$index])) {
		$singleCollection = array();
		foreach($currentFollowers[$index] as $follower => $count) {
			if (!$noEOF || $follower != 'EOF' && $follower != 'PART2') {
				for ($i = 0; $i < $count; $i++) {
					$singleCollection[] = $follower;
				}
			}
		}
		if (count($singleCollection)) {
			$repeats = round(($singleTokensLength * $multiplicity) / count($singleCollection));
			$repeats = $repeats > 0 ? $repeats : 1;
			foreach($singleCollection as $follower) {
				for ($i = 0; $i < $repeats; $i++) {
					$collection[] = $follower;
				}
			}
		}
	}
	return $collection;
}

function getHeadlineTokens($followers, $history, $hadPart2) {
	$lastToken = $history[count($history) - 1];
	if ($lastToken == 'EOF') {
		return $history;
	}

	$currentFollowers = array();
	$currentFollowers[0] = array();
	$currentFollowers[1] = array();
	$currentFollowers[2] = array();
	$currentFollowers[3] = array();
	if ($lastToken != 'PART2') {
		$currentFollowers[0] = $followers[$lastToken];
		if (isset($history[count($history) - 2])) {
			$doubleToken = $history[count($history) - 2] . ' ' . $lastToken;
			$currentFollowers[1] = isset($followers[$doubleToken]) ? $followers[$doubleToken] : array();
		}
	}
	if (isset($history[count($history) - 3])) {
		$trippleToken = $history[count($history) - 3] . ' ' . $history[count($history) - 2] . ' ' . $lastToken;
		$currentFollowers[2] = isset($followers[$trippleToken]) ? $followers[$trippleToken] : array();
	}
	if (isset($history[count($history) - 4])) {
		$quadrupleToken = $history[count($history) - 4] . ' ' . $history[count($history) - 3] . ' ' . $history[count($history) - 2] . ' ' . $lastToken;
		$currentFollowers[3] = isset($followers[$quadrupleToken]) ? $followers[$quadrupleToken] : array();
	}
	
	$randomizer = array();
	$randomizer = array_merge($randomizer, getFollowerCollection($currentFollowers, 0, 1, true));
	$randomizer = array_merge($randomizer, getFollowerCollection($currentFollowers, 1, 2.5, false));
	$randomizer = array_merge($randomizer, getFollowerCollection($currentFollowers, 2, 2.5, false));
	$randomizer = array_merge($randomizer, getFollowerCollection($currentFollowers, 3, 1.5, false));
	shuffle($randomizer);

	while (true) {
		if (!count($randomizer)) {
			return $history;
		}
		$token = array_pop($randomizer);
		if (tokenIsAllowed($token, $hadPart2)) {
			$history[] = $token;
			if ($token == 'EOF') {
				return $history;
			}
			$nextHadPart2 = $hadPart2 || $token == 'PART2';
			$nextHistory = getHeadlineTokens($followers, $history, $nextHadPart2);
			if ($nextHistory[count($nextHistory) - 1] == 'EOF') {
				return $nextHistory;
			} else {
				array_pop($history);
			}
		}
	};
}

function fixPart($headlinePart) {
	$headlinePart = implode(' ', $headlinePart);
	while (substr_count($headlinePart, '»') > substr_count($headlinePart, '«')) {
		$index = strpos($headlinePart, '»');
		$headlinePart = substr($headlinePart, 0, $index) + substr($headlinePart, $index + 1);
	}
	while (substr_count($headlinePart, '«') > substr_count($headlinePart, '»')) {
		$headlinePart .= '»';
	}
	$headlinePart = str_replace('- -', '-', $headlinePart);
	return $headlinePart;
}

function getHeadline($followers, $headlines) {
	do {
		$headlineTokens = getHeadlineTokens($followers, array('SOF'), false);
		$headlineTokens = array_slice($headlineTokens, 1, -1);
		$part2Index = array_search('PART2', $headlineTokens);
		$headlinePart1 = fixPart(array_slice($headlineTokens, 0, $part2Index));
		$headlinePart2 = fixPart(array_slice($headlineTokens, $part2Index + 1));
		$bad = false;
		foreach ($headlines as $headline) {
			if (substr_count($headline, $headlinePart2)) {
				$bad = true;
				break;
			}
		}
	} while($bad);
	
	return array($headlinePart1, $headlinePart2);
}
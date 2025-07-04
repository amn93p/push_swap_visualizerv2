<?php
// --- Backend PHP Unifié ---

// S'exécute uniquement si la requête est de type POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Empêche l'affichage des erreurs PHP au client pour la sécurité
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);

    header('Content-Type: application/json');
    $tmpDir = sys_get_temp_dir() . '/push_swap_tools_' . uniqid();

    try {
        // --- Vérification de l'environnement serveur ---
        if (!function_exists('shell_exec') || false !== strpos(ini_get('disable_functions'), 'shell_exec')) {
            throw new Exception("ERREUR SERVEUR: La fonction PHP 'shell_exec' est désactivée sur cet hébergeur. L'outil ne peut pas fonctionner. Veuillez utiliser un serveur local (WAMP, MAMP, XAMPP) ou un VPS.");
        }
        
        // --- Validation des paramètres ---
        $requestType = filter_input(INPUT_POST, 'requestType', FILTER_SANITIZE_STRING);
        $listSize = filter_input(INPUT_POST, 'listSize', FILTER_VALIDATE_INT);

        if (!$requestType || $listSize === false) {
            throw new Exception("ERREUR CLIENT: Paramètres manquants ou invalides.");
        }

        // --- Création du répertoire temporaire ---
        if (!mkdir($tmpDir, 0755, true)) {
            throw new Exception("ERREUR PERMISSION: Impossible de créer le répertoire temporaire.");
        }

        // --- Gestion des fichiers uploadés ---
        if (!isset($_FILES['pushSwapFile']) || !is_uploaded_file($_FILES['pushSwapFile']['tmp_name'])) {
            throw new Exception("ERREUR CLIENT: Fichier 'push_swap' manquant.");
        }
        $pushSwapPath = $tmpDir . '/push_swap';
        if (!move_uploaded_file($_FILES['pushSwapFile']['tmp_name'], $pushSwapPath) || !chmod($pushSwapPath, 0755)) {
            throw new Exception("ERREUR PERMISSION: Impossible de traiter le fichier 'push_swap'.");
        }

        // --- Génération des arguments ---
        $arg_command = "shuf -i 1-" . ($listSize * 2) . " -n " . $listSize . " | tr '\\n' ' '";
        $args = trim(shell_exec($arg_command));
        if (empty($args)) {
            throw new Exception("ERREUR COMMANDE: 'shuf' a échoué. Est-elle installée sur le serveur ?");
        }

        // --- Exécution en fonction du type de requête ---
        $result = [];
        $error_redirect = ' 2>&1';

        if ($requestType === 'tester_check' || $requestType === 'tester_count') {
            // Pour le Tester, on a besoin du checker
            if (!isset($_FILES['checkerFile']) || !is_uploaded_file($_FILES['checkerFile']['tmp_name'])) {
                throw new Exception("ERREUR CLIENT: Fichier 'checker' manquant pour le mode Tester.");
            }
            $checkerPath = $tmpDir . '/checker';
            if (!move_uploaded_file($_FILES['checkerFile']['tmp_name'], $checkerPath) || !chmod($checkerPath, 0755)) {
                throw new Exception("ERREUR PERMISSION: Impossible de traiter le fichier 'checker'.");
            }

            if ($requestType === 'tester_check') {
                $command = "cd $tmpDir && ./push_swap $args | ./checker $args" . $error_redirect;
                $output = trim(shell_exec($command));
                $result = ['status' => 'success', 'output' => $output, 'args' => $args];
            } else { // tester_count
                $command = "cd $tmpDir && ./push_swap $args | wc -l" . $error_redirect;
                $opCount = (int)trim(shell_exec($command));
                $result = ['status' => 'success', 'opCount' => $opCount, 'args' => $args];
            }
        } elseif ($requestType === 'visualizer_run') {
            // Pour le Visualizer, on a juste besoin des opérations
            $command = "cd $tmpDir && ./push_swap $args" . $error_redirect;
            $operations = trim(shell_exec($command));
            $result = ['status' => 'success', 'operations' => $operations, 'numbers' => $args];
        } else {
            throw new Exception("Type de requête invalide.");
        }

        echo json_encode($result);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    } finally {
        if (is_dir($tmpDir)) {
            if (file_exists($tmpDir . '/push_swap')) @unlink($tmpDir . '/push_swap');
            if (file_exists($tmpDir . '/checker')) @unlink($tmpDir . '/checker');
            @rmdir($tmpDir);
        }
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Push Swap Tools | Suite Complète</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #111827; background-image: radial-gradient(at 47% 33%, hsl(218.00, 45%, 15%) 0, transparent 59%), radial-gradient(at 82% 65%, hsl(263.00, 42%, 18%) 0, transparent 55%); color: #F9FAFB; }
        .tab.active { background-color: #0d9488; color: #ffffff; }
        .app-section { display: none; }
        .app-section.active { display: block; }
        .number-block { transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); will-change: transform; }
    </style>
</head>
<body class="min-h-screen">
    <nav class="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-50 border-b border-gray-700">
        <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-2xl font-bold text-white">PushSwap<span class="text-teal-400">.tools</span></h1>
            <div id="app-tabs" class="flex items-center space-x-2 p-1 bg-gray-700 rounded-lg">
                <button data-tab="tester" class="tab active text-gray-300 px-4 py-1.5 rounded-md text-sm font-medium transition-colors">Tester</button>
                <button data-tab="visualizer" class="tab text-gray-300 px-4 py-1.5 rounded-md text-sm font-medium transition-colors">Visualizer</button>
            </div>
        </div>
    </nav>

    <main class="p-4 sm:p-6 lg:p-8">
        <section id="tester-section" class="app-section active">
            <div class="w-full max-w-3xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-8">
                <form id="tester-form" class="space-y-6">
                    <div class="grid md:grid-cols-2 gap-6">
                        <div class="bg-gray-700/50 p-6 rounded-lg space-y-4">
                            <h3 class="text-lg font-semibold text-white border-b border-gray-600 pb-2">Fichiers à Uploader</h3>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">1. Exécutable `push_swap`</label>
                                <div class="mt-1 flex items-center">
                                    <label for="tester-push-swap-file" class="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Parcourir...</label>
                                    <input type="file" id="tester-push-swap-file" name="pushSwapFile" class="hidden" required>
                                    <span id="tester-push-swap-filename" class="ml-3 text-sm text-gray-400 truncate">Aucun fichier choisi</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">2. Binaire `checker`</label>
                                <div class="mt-1 flex items-center">
                                    <label for="tester-checker-file" class="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Parcourir...</label>
                                    <input type="file" id="tester-checker-file" name="checkerFile" class="hidden" required>
                                    <span id="tester-checker-filename" class="ml-3 text-sm text-gray-400 truncate">Aucun fichier choisi</span>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-700/50 p-6 rounded-lg">
                            <h3 class="text-lg font-semibold text-white border-b border-gray-600 pb-2">Paramètres</h3>
                            <div class="grid grid-cols-1 gap-4 mt-4">
                                <div><label for="tester-list-size" class="block text-sm font-medium text-gray-300">Taille de la liste</label><input type="number" id="tester-list-size" value="100" class="mt-1 w-full bg-gray-700 rounded-md p-2"></div>
                                <div><label for="tester-max-ops" class="block text-sm font-medium text-gray-300">Opérations max</label><input type="number" id="tester-max-ops" value="700" class="mt-1 w-full bg-gray-700 rounded-md p-2"></div>
                                <div><label for="tester-num-tests" class="block text-sm font-medium text-gray-300">Nbre de tests</label><input type="number" id="tester-num-tests" value="100" class="mt-1 w-full bg-gray-700 rounded-md p-2"></div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between pt-4">
                        <div class="flex items-center"><input id="tester-show-args" type="checkbox" class="h-4 w-4 text-teal-600 rounded bg-gray-700"><label for="tester-show-args" class="ml-2 text-sm">Afficher les arguments si KO</label></div>
                        <button type="submit" id="start-tester-btn" class="py-2 px-6 rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>Lancer les tests</button>
                    </div>
                </form>
                <div id="tester-results-container" class="space-y-4 pt-6 border-t border-gray-700"></div>
            </div>
        </section>

        <section id="visualizer-section" class="app-section">
            <div class="w-full max-w-4xl mx-auto">
                <form id="visualizer-form" class="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 space-y-6">
                    <div>
                        <h2 class="text-xl font-bold mb-3 text-gray-200">Configuration</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-gray-900 p-4 rounded-lg space-y-3">
                                <label class="block text-sm font-medium text-gray-300 mb-2">1. Exécutable `push_swap`</label>
                                <div class="mt-1 flex items-center">
                                    <label for="viz-push-swap-file" class="cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Parcourir...</label>
                                    <input type="file" id="viz-push-swap-file" name="pushSwapFile" class="hidden" required>
                                    <span id="viz-push-swap-filename" class="ml-3 text-sm text-gray-400 truncate">Aucun fichier choisi</span>
                                </div>
                            </div>
                            <div class="bg-gray-900 p-4 rounded-lg space-y-3">
                                <label for="viz-list-size" class="text-gray-300 font-semibold">2. Nombres à trier</label>
                                <div class="flex items-center gap-4"><input type="range" id="viz-list-size" min="3" max="500" value="5" class="w-full accent-cyan-500"><span id="viz-list-size-value" class="w-12 text-center bg-gray-700 rounded-md py-1">5</span></div>
                            </div>
                            <div class="bg-gray-900 p-4 rounded-lg space-y-3">
                                <label for="viz-speed-slider" class="text-gray-300 font-semibold">3. Vitesse d'animation</label>
                                <div class="flex items-center gap-4"><input id="viz-speed-slider" type="range" min="50" max="1000" value="500" class="w-full accent-cyan-500"><span id="viz-speed-value" class="w-20 text-center bg-gray-700 rounded-md py-1">550ms</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="text-center"><button type="submit" id="start-visualizer-btn" class="bg-gradient-to-br from-cyan-500 to-cyan-700 text-white font-bold py-3 px-8 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled>Générer & Visualiser</button></div>
                </form>
                 <div id="viz-container" class="mt-6 hidden">
                    <div class="bg-gray-800 p-4 rounded-xl mb-4 flex items-center justify-between gap-4 border border-gray-700">
                         <div class="flex items-center gap-3"><button id="viz-play-pause-btn" class="w-32 py-2 px-5 rounded-lg"></button></div>
                         <div class="font-mono text-lg text-center"><span class="text-gray-400">Opérations: </span><span id="viz-move-counter" class="font-bold text-white">0 / 0</span></div>
                     </div>
                     <div class="text-center mb-4 h-8"><span id="viz-current-move" class="font-mono text-2xl text-yellow-400">&nbsp;</span></div>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
                         <div class="bg-gray-800/50 rounded-xl p-4 flex flex-col"><h2 class="text-2xl font-bold text-center mb-4 text-cyan-400">Pile A</h2><div id="viz-stack-a" class="flex flex-col items-center gap-2 flex-grow"></div></div>
                         <div class="bg-gray-800/50 rounded-xl p-4 flex flex-col"><h2 class="text-2xl font-bold text-center mb-4 text-pink-400">Pile B</h2><div id="viz-stack-b" class="flex flex-col items-center gap-2 flex-grow"></div></div>
                     </div>
                 </div>
            </div>
        </section>
    </main>
    
    <script>
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('app-tabs').addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') return;
            const targetTab = e.target.dataset.tab;
            document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
            document.getElementById(`${targetTab}-section`).classList.add('active');
            document.querySelectorAll('#app-tabs button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });

        function setupFileInput(inputId, filenameId, validationCallback) {
            const input = document.getElementById(inputId);
            const filenameSpan = document.getElementById(filenameId);
            if (input && filenameSpan) {
                input.addEventListener('change', () => {
                    filenameSpan.textContent = input.files.length > 0 ? input.files[0].name : 'Aucun fichier choisi';
                    if (validationCallback) validationCallback();
                });
            }
        }
        
        const testerPushSwapFile = document.getElementById('tester-push-swap-file');
        const testerCheckerFile = document.getElementById('tester-checker-file');
        const startTesterBtn = document.getElementById('start-tester-btn');
        const validateTesterFiles = () => {
            startTesterBtn.disabled = !(testerPushSwapFile.files.length > 0 && testerCheckerFile.files.length > 0);
        };
        setupFileInput('tester-push-swap-file', 'tester-push-swap-filename', validateTesterFiles);
        setupFileInput('tester-checker-file', 'tester-checker-filename', validateTesterFiles);

        const vizPushSwapFile = document.getElementById('viz-push-swap-file');
        const startVisualizerBtn = document.getElementById('start-visualizer-btn');
        const validateVizFiles = () => {
            startVisualizerBtn.disabled = !(vizPushSwapFile.files.length > 0);
        };
        setupFileInput('viz-push-swap-file', 'viz-push-swap-filename', validateVizFiles);

        const testerForm = document.getElementById('tester-form');
        testerForm.addEventListener('submit', async e => {
            e.preventDefault();
            const testerResultsContainer = document.getElementById('tester-results-container');
            const numTests = parseInt(document.getElementById('tester-num-tests').value, 10);
            const listSize = parseInt(document.getElementById('tester-list-size').value, 10);
            const maxOps = parseInt(document.getElementById('tester-max-ops').value, 10);
            const showArgs = document.getElementById('tester-show-args').checked;
            
            testerResultsContainer.innerHTML = '';
            startTesterBtn.disabled = true; startTesterBtn.textContent = 'Tests en cours...';

            const runLoop = async (testType, limit) => {
                const ui = createProgressUI(`➤ Test ${testType==='tester_check'?1:2}: ${testType==='tester_check'?'Vérification...':'Comptage ops...'}`, testerResultsContainer);
                for (let i = 1; i <= numTests; i++) {
                    const formData = new FormData(testerForm);
                    formData.append('requestType', testType);
                    formData.append('listSize', listSize);
                    
                    const res = await runPhpBackend(formData);
                    const isError = res.status === 'error' || (testType === 'tester_check' && res.output !== "OK") || (testType === 'tester_count' && res.opCount > limit);
                    
                    if (isError) {
                        let out = res.output !== undefined ? res.output : (res.opCount !== undefined ? `${res.opCount} ops` : res.message);
                        let msg = `<span class="font-bold">✘ KO ➜ ${out}</span>`;
                        if (showArgs && res.args) msg += `\n<span class="font-mono text-yellow-400/80 text-xs">Args: ${res.args}</span>`;
                        ui.setResult(msg, false); return false;
                    }
                    ui.update(i, numTests);
                }
                ui.setResult(`✔ Test ${testType==='tester_check'?1:2} passé`, true); return true;
            };

            if (await runLoop('tester_check', Infinity)) {
                await runLoop('tester_count', maxOps);
            }
            startTesterBtn.disabled = false; startTesterBtn.textContent = 'Lancer les tests';
        });

        let vizState = { isPlaying: false, intervalId: null, animationSpeed: 550 };
        const visualizerForm = document.getElementById('visualizer-form');
        const vizListSizeSlider = document.getElementById('viz-list-size');
        const vizSpeedSlider = document.getElementById('viz-speed-slider');
        const vizSpeedValue = document.getElementById('viz-speed-value');
        
        vizListSizeSlider.addEventListener('input', e => { document.getElementById('viz-list-size-value').textContent = e.target.value; });
        
        vizSpeedSlider.addEventListener('input', () => {
            vizState.animationSpeed = 1050 - parseInt(vizSpeedSlider.value, 10);
            vizSpeedValue.textContent = `${vizState.animationSpeed}ms`;
            if (vizState.isPlaying) {
                clearInterval(vizState.intervalId);
                vizState.intervalId = setInterval(nextVizStep, vizState.animationSpeed);
            }
        });

        visualizerForm.addEventListener('submit', async e => {
            e.preventDefault();
            startVisualizerBtn.textContent = "Génération..."; startVisualizerBtn.disabled = true;
            const formData = new FormData(visualizerForm);
            formData.append('requestType', 'visualizer_run');
            formData.append('listSize', vizListSizeSlider.value);
            const res = await runPhpBackend(formData);
            if (res.status === 'error') {
                alert(`Erreur: ${res.message}`);
            } else {
                const numbers = res.numbers.split(' ').map(Number);
                const moves = res.operations.trim() ? res.operations.trim().split('\n') : [];
                document.getElementById('viz-container').classList.remove('hidden');
                setupVisualizer(numbers, moves);
            }
            startVisualizerBtn.textContent = "Générer & Visualiser"; startVisualizerBtn.disabled = false;
        });

        function setupVisualizer(numbers, moves) {
            if (vizState.intervalId) clearInterval(vizState.intervalId);
            Object.assign(vizState, {
                initialStack: [...numbers], moves, stackA: [...numbers], stackB: [],
                currentMoveIndex: 0, totalMoves: moves.length, isPlaying: false,
                minVal: Math.min(...numbers), maxVal: Math.max(...numbers)
            });
            document.getElementById('viz-play-pause-btn').onclick = () => playPauseViz();
            renderVizStacks();
            playPauseViz();
        }

        function renderVizStacks() {
            const oldPositions = new Map();
            document.querySelectorAll('#viz-stack-a .number-block, #viz-stack-b .number-block').forEach(block => {
                oldPositions.set(block.dataset.value, block.getBoundingClientRect());
            });
            const vizStackA = document.getElementById('viz-stack-a');
            const vizStackB = document.getElementById('viz-stack-b');
            vizStackA.innerHTML = ''; vizStackB.innerHTML = '';
            
            const createBlock = num => {
                const block = document.createElement('div');
                const range = vizState.maxVal - vizState.minVal;
                const norm = range > 0 ? (num - vizState.minVal) / range : 0.5;
                block.textContent = num;
                block.dataset.value = num;
                block.className = 'number-block flex items-center justify-center h-8 rounded-md text-xs font-semibold text-gray-900 shadow-lg';
                block.style.width = `${40 + 60 * norm}%`;
                block.style.background = `hsl(${200 + 160 * (1 - norm)}, 70%, 55%)`;
                return block;
            };
            vizState.stackA.forEach(num => vizStackA.appendChild(createBlock(num)));
            vizState.stackB.forEach(num => vizStackB.appendChild(createBlock(num)));
            document.getElementById('viz-move-counter').textContent = `${vizState.currentMoveIndex} / ${vizState.totalMoves}`;

            document.querySelectorAll('#viz-stack-a .number-block, #viz-stack-b .number-block').forEach(block => {
                const oldPos = oldPositions.get(block.dataset.value);
                if (!oldPos) return;
                const newPos = block.getBoundingClientRect();
                const dx = oldPos.left - newPos.left;
                const dy = oldPos.top - newPos.top;
                if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                    requestAnimationFrame(() => {
                        block.style.transform = `translate(${dx}px, ${dy}px)`;
                        block.style.transition = 'transform 0s';
                        requestAnimationFrame(() => {
                            block.style.transform = '';
                            block.style.transition = `transform ${vizState.animationSpeed / 1000}s cubic-bezier(0.4, 0, 0.2, 1)`;
                        });
                    });
                }
            });
        }

        function playPauseViz() {
            const btn = document.getElementById('viz-play-pause-btn');
            const baseClasses = "font-bold py-2 px-5 rounded-lg w-32 text-white transition-colors";
            if (vizState.isPlaying) {
                clearInterval(vizState.intervalId);
                vizState.isPlaying = false;
                btn.textContent = 'Reprendre'; btn.className = `${baseClasses} bg-green-600 hover:bg-green-700`; btn.disabled = false;
            } else {
                if (vizState.currentMoveIndex >= vizState.totalMoves) return;
                vizState.isPlaying = true;
                vizState.intervalId = setInterval(nextVizStep, vizState.animationSpeed);
                btn.textContent = 'Pause'; btn.className = `${baseClasses} bg-yellow-500 hover:bg-yellow-600`; btn.disabled = false;
            }
        }
        
        function nextVizStep() {
            const currentMoveEl = document.getElementById('viz-current-move');
            const playPauseBtn = document.getElementById('viz-play-pause-btn');
            if (vizState.currentMoveIndex >= vizState.totalMoves) {
                clearInterval(vizState.intervalId);
                vizState.isPlaying = false;
                const finalResult = runJavaScriptChecker(vizState.moves.join('\n'), vizState.initialStack);
                currentMoveEl.textContent = finalResult === "OK" ? "Terminé : Trié ✔️" : `Terminé : ${finalResult} ❌`;
                playPauseBtn.textContent = 'Terminé';
                playPauseBtn.disabled = true;
                playPauseBtn.className = `font-bold py-2 px-5 rounded-lg w-32 text-white transition-colors bg-gray-600 opacity-50 cursor-not-allowed`;
                return;
            }
            const move = vizState.moves[vizState.currentMoveIndex];
            currentMoveEl.textContent = move;
            let { stackA, stackB } = vizState;
            switch (move) {
                case 'sa': if (stackA.length > 1) [stackA[0], stackA[1]] = [stackA[1], stackA[0]]; break;
                case 'pa': if (stackB.length > 0) stackA.unshift(stackB.shift()); break;
                case 'pb': if (stackA.length > 0) stackB.unshift(stackA.shift()); break;
                case 'ra': if (stackA.length > 1) stackA.push(stackA.shift()); break;
                case 'rra': if (stackA.length > 1) stackA.unshift(stackA.pop()); break;
                case 'sb': if (stackB.length > 1) [stackB[0], stackB[1]] = [stackB[1], stackB[0]]; break;
                case 'rb': if (stackB.length > 1) stackB.push(stackB.shift()); break;
                case 'rrb': if (stackB.length > 1) stackB.unshift(stackB.pop()); break;
                case 'ss': if (stackA.length > 1) [stackA[0], stackA[1]] = [stackA[1], stackA[0]]; if (stackB.length > 1) [stackB[0], stackB[1]] = [stackB[1], stackB[0]]; break;
                case 'rr': if (stackA.length > 1) stackA.push(stackA.shift()); if (stackB.length > 1) stackB.push(stackB.shift()); break;
                case 'rrr': if (stackA.length > 1) stackA.unshift(stackA.pop()); if (stackB.length > 1) stackB.unshift(stackB.pop()); break;
            }
            vizState.currentMoveIndex++;
            renderVizStacks();
        }

        function runJavaScriptChecker(ops, args) {
            let a = [...args], b = [], m = ops.trim() ? ops.trim().split('\n') : [];
            for (const op of m) {
                switch (op) {
                    case 'sa': if (a.length > 1) [a[0], a[1]] = [a[1], a[0]]; break;
                    case 'pa': if (b.length > 0) a.unshift(b.shift()); break;
                    case 'pb': if (a.length > 0) b.unshift(a.shift()); break;
                    case 'ra': if (a.length > 1) a.push(a.shift()); break;
                    case 'rra': if (a.length > 1) a.unshift(a.pop()); break;
                    case 'sb': if (b.length > 1) [b[0], b[1]] = [b[1], b[0]]; break;
                    case 'rb': if (b.length > 1) b.push(b.shift()); break;
                    case 'rrb': if (b.length > 1) b.unshift(b.pop()); break;
                    case 'ss': if (a.length > 1) [a[0], a[1]] = [a[1], a[0]]; if (b.length > 1) [b[0], b[1]] = [b[1], b[0]]; break;
                    case 'rr': if (a.length > 1) a.push(a.shift()); if (b.length > 1) b.push(b.shift()); break;
                    case 'rrr': if (a.length > 1) a.unshift(a.pop()); if (b.length > 1) b.unshift(b.pop()); break;
                    default: return `KO (op invalide: ${op})`;
                }
            }
            if (b.length !== 0) return "KO (pile B non vide)";
            for (let i = 0; i < a.length - 1; i++) if (a[i] > a[i + 1]) return "KO (pile A non triée)";
            return "OK";
        }

        async function runPhpBackend(formData) {
            try {
                const response = await fetch('index.php', { method: 'POST', body: formData });
                const text = await response.text();
                if (!response.ok) {
                    try { return JSON.parse(text); } catch (e) { throw new Error(`Erreur Serveur (${response.status}): ${text}`); }
                }
                return JSON.parse(text);
            } catch (error) {
                return { status: 'error', message: error.message };
            }
        }

        function createProgressUI(title, container) {
            const testId = `test-${Date.now()}`;
            const testDiv = document.createElement('div');
            testDiv.className = 'bg-gray-700/50 p-4 rounded-lg';
            testDiv.innerHTML = `<h3 class="font-semibold text-white">${title}</h3><div class="w-full bg-gray-600 rounded-full h-2.5 mt-2"><div id="${testId}" class="bg-blue-500 h-2.5 rounded-full" style="width: 0%"></div></div><div id="status-${testId}" class="text-right text-sm text-gray-400 mt-1">0%</div>`;
            container.appendChild(testDiv);
            return {
                update: (current, total) => {
                    const percent = Math.round((current / total) * 100);
                    const bar = document.getElementById(testId);
                    if(bar) bar.style.width = `${percent}%`;
                    document.getElementById(`status-${testId}`).textContent = `${percent}%`;
                },
                setResult: (message, isSuccess) => {
                    const statusEl = document.getElementById(`status-${testId}`);
                    statusEl.style.whiteSpace = 'pre-wrap';
                    statusEl.innerHTML = message;
                    statusEl.className = isSuccess ? 'text-green-400 font-bold text-right' : 'text-red-400 font-bold text-left';
                    document.getElementById(testId).classList.replace('bg-blue-500', isSuccess ? 'bg-green-500' : 'bg-red-500');
                }
            };
        }
    });
    </script>
</body>
</html>
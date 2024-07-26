/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var cannon_es__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! cannon-es */ "./node_modules/cannon-es/dist/cannon-es.js");
/* harmony import */ var lil_gui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lil-gui */ "./node_modules/lil-gui/dist/lil-gui.esm.js");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
// 22FI038 川瀬友里




class ThreeJSContainer {
    scene;
    light;
    wallNum;
    planeBody;
    stopBody;
    goalBody;
    goalMesh;
    cloud;
    particleVelocity;
    isColliding = false;
    collisionCooldown = 500;
    goalMoveSpeed = 0.5;
    count = 0;
    moveGoal(dx) {
        const newX = this.goalBody.position.x + dx;
        if (newX > -10 && newX < 10) { // 画面の端を-6から6と仮定
            this.goalBody.position.x = newX;
            this.goalMesh.position.x = newX;
        }
    }
    constructor() { }
    // 画面部分の作成(表示する枠ごとに)*
    createRendererDOM = (width, height, cameraPos) => {
        const renderer = new three__WEBPACK_IMPORTED_MODULE_1__.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new three__WEBPACK_IMPORTED_MODULE_1__.Color(0x9BE5DE));
        renderer.shadowMap.enabled = true; //シャドウマップを有効にする
        //カメラの設定
        const camera = new three__WEBPACK_IMPORTED_MODULE_1__.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 0, 0));
        const orbitControls = new three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__.OrbitControls(camera, renderer.domElement);
        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        const render = (time) => {
            orbitControls.update();
            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    };
    // シーンの作成(全体で1回)
    createScene = () => {
        this.scene = new three__WEBPACK_IMPORTED_MODULE_1__.Scene();
        let createParticles = () => {
            //ジオメトリの作成
            const geometry = new three__WEBPACK_IMPORTED_MODULE_1__.BufferGeometry();
            //マテリアルの作成
            const textureLoader = new three__WEBPACK_IMPORTED_MODULE_1__.TextureLoader();
            const texture = textureLoader.load("raindrop.png");
            const material = new three__WEBPACK_IMPORTED_MODULE_1__.PointsMaterial({
                size: 1,
                map: texture,
                blending: three__WEBPACK_IMPORTED_MODULE_1__.AdditiveBlending,
                color: 0xffffff,
                depthWrite: false,
                transparent: true,
                opacity: 0.5,
            });
            //particleの作成
            const particleNum = 100; // パーティクルの数
            const positions = new Float32Array(particleNum * 3);
            let particleIndex = 0;
            this.particleVelocity = [];
            for (let i = 0; i < particleNum; i++) {
                positions[particleIndex++] = Math.random() * 30 - 15; // x座標
                positions[particleIndex++] = Math.random() * 30; // y座標
                positions[particleIndex++] = Math.random() * 30 - 15; // z座標
                this.particleVelocity.push(new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, -0.3 * Math.random() - 0.05, 0));
            }
            geometry.setAttribute("position", new three__WEBPACK_IMPORTED_MODULE_1__.BufferAttribute(positions, 3));
            //THREE.Pointsの作成
            this.cloud = new three__WEBPACK_IMPORTED_MODULE_1__.Points(geometry, material);
            //シーンへの追加
            this.scene.add(this.cloud);
        };
        createParticles();
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    this.moveGoal(-this.goalMoveSpeed);
                    break;
                case 'ArrowRight':
                    this.moveGoal(this.goalMoveSpeed);
                    break;
            }
        });
        // 物理空間の設定
        const world = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.World({
            gravity: new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Vec3(0, -9.82, 0),
        });
        world.defaultContactMaterial.friction = 0.0;
        world.defaultContactMaterial.restitution = 0.0;
        // let cubeBodys: CANNON.Body[] = [];
        // // 物理空間 Boxの作成
        // this.cubeNum = 50;
        // for(let i=0; i<this.cubeNum; i++){
        // const cubeShape = new CANNON.Box(new CANNON.Vec3(0.35, 0.5, 0.1));
        // const cubeMaterial = new CANNON.Material({ friction: 0.02, restitution: 0.0 });
        // cubeBodys[i] = new CANNON.Body({ mass: 1 , material: cubeMaterial });
        // cubeBodys[i].addShape(cubeShape);
        // }
        let wallBodys = [];
        // 物理空間 壁の作成
        this.wallNum = 9;
        for (let i = 0; i < this.wallNum; i++) {
            const wallShapes = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Vec3(0.35, 0.5, 0.1));
            wallBodys[i] = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 0 });
            wallBodys[i].addShape(wallShapes);
        }
        // 物理空間 止まる壁の作成
        const stopShape = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Vec3(10, 1.5, 0.3));
        this.stopBody = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 0 });
        this.stopBody.addShape(stopShape);
        // 物理空間 ゴールの作成
        const goalShape = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Vec3(1, 1.5, 0.3));
        this.goalBody = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 0 });
        this.goalBody.addShape(goalShape);
        // 物理空間 Planeの作成
        const planeShape = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Plane();
        this.planeBody = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 0 });
        this.planeBody.addShape(planeShape);
        // 物理空間 ボールの作成
        const ballShape = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Sphere(0.4);
        const ballBody = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 1 });
        ballBody.addShape(ballShape);
        // Boxの作成
        const geometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxGeometry(0.7, 1, 0.2);
        const material = new three__WEBPACK_IMPORTED_MODULE_1__.MeshBasicMaterial({ color: 0xE59BDA });
        // for(let i=0; i<this.cubeNum; i++){
        //     const radius = 6;
        //     const theta = Math.PI * 2 * i / this.cubeNum;
        //     const circleX = radius * Math.cos(theta);
        //     const circleZ = radius * Math.sin(theta);
        // cubes[i] = new THREE.Mesh(geometry, material);
        // cubes[i].position.x = circleX;
        // cubes[i].position.y = 5;
        // cubes[i].position.z = circleZ;
        // cubes[i].rotation.y = - Math.PI * 2 * i / this.cubeNum;
        // if(i === 0){
        // cubes[i].rotation.x = 0.5;
        // }
        // this.scene.add(cubes[i]);
        // }
        let wallMeshs = [];
        // 壁の作成
        for (let i = 0; i < this.wallNum; i++) {
            wallMeshs[i] = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(geometry, material);
            wallMeshs[i].position.y = 2;
            wallMeshs[i].position.x = 2 * i - 8;
            wallMeshs[i].rotation.x = Math.PI / 2 - 40;
            this.scene.add(wallMeshs[i]);
        }
        // 止まる壁の作成
        const stopGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxGeometry(20, 3, 0.6);
        const stopMaterial = new three__WEBPACK_IMPORTED_MODULE_1__.MeshBasicMaterial({ color: 0xE59BDA });
        const stopMesh = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(stopGeometry, stopMaterial);
        stopMesh.position.z = 10;
        this.scene.add(stopMesh);
        // ゴールの作成
        const goalGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxGeometry(2, 3, 0.6);
        const goalMaterial = new three__WEBPACK_IMPORTED_MODULE_1__.MeshPhongMaterial({ color: 0xd2b48c });
        this.goalMesh = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(goalGeometry, goalMaterial);
        this.goalMesh.position.z = 8;
        this.scene.add(this.goalMesh);
        // Planeの作成
        const phongMaterial = new three__WEBPACK_IMPORTED_MODULE_1__.MeshBasicMaterial({ color: 0xE5DE9B });
        const planeGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.PlaneGeometry(25, 25);
        const planeMesh = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(planeGeometry, phongMaterial);
        planeMesh.material.side = three__WEBPACK_IMPORTED_MODULE_1__.DoubleSide; // 両面
        planeMesh.rotateX(-Math.PI / 2);
        this.scene.add(planeMesh);
        // ボールの作成
        const ballGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.SphereGeometry(0.4, 32, 16);
        const ballMaterial = new three__WEBPACK_IMPORTED_MODULE_1__.MeshNormalMaterial();
        const sphere = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(ballGeometry, ballMaterial);
        sphere.position.y = 4;
        this.scene.add(sphere);
        // Box 紐づけ
        // for(let i=0; i<this.cubeNum; i++){
        // cubeBodys[i].position.set(cubes[i].position.x, cubes[i].position.y, cubes[i].position.z);
        // cubeBodys[i].quaternion.set(cubes[i].quaternion.x, cubes[i].quaternion.y, cubes[i].quaternion.z, cubes[i].quaternion.w);
        // }
        for (let i = 0; i < this.wallNum; i++) {
            // 壁 紐づけ
            wallBodys[i].position.set(wallMeshs[i].position.x, wallMeshs[i].position.y, wallMeshs[i].position.z);
            wallBodys[i].quaternion.set(wallMeshs[i].quaternion.x, wallMeshs[i].quaternion.y, wallMeshs[i].quaternion.z, wallMeshs[i].quaternion.w);
        }
        // 止まる壁 紐づけ
        this.stopBody.position.set(stopMesh.position.x, stopMesh.position.y, stopMesh.position.z);
        this.stopBody.quaternion.set(stopMesh.quaternion.x, stopMesh.quaternion.y, stopMesh.quaternion.z, stopMesh.quaternion.w);
        // ゴール 紐づけ
        this.goalBody.position.set(this.goalMesh.position.x, this.goalMesh.position.y, this.goalMesh.position.z);
        this.goalBody.quaternion.set(this.goalMesh.quaternion.x, this.goalMesh.quaternion.y, this.goalMesh.quaternion.z, this.goalMesh.quaternion.w);
        // plane 紐づけ
        this.planeBody.position.set(planeMesh.position.x, planeMesh.position.y, planeMesh.position.z);
        this.planeBody.quaternion.set(planeMesh.quaternion.x, planeMesh.quaternion.y, planeMesh.quaternion.z, planeMesh.quaternion.w);
        // ボール 紐づけ
        ballBody.position.set(sphere.position.x, sphere.position.y, sphere.position.z);
        ballBody.quaternion.set(sphere.quaternion.x, sphere.quaternion.y, sphere.quaternion.z, sphere.quaternion.w);
        // 追加
        world.addBody(this.planeBody);
        // for(let i=0; i<this.cubeNum; i++){
        // world.addBody(cubeBodys[i]);
        // }
        for (let i = 0; i < this.wallNum; i++) {
            world.addBody(wallBodys[i]);
        }
        world.addBody(ballBody);
        world.addBody(this.stopBody);
        world.addBody(this.goalBody);
        // // グリッド表示
        // const gridHelper = new THREE.GridHelper(10);
        // this.scene.add(gridHelper);
        // // 軸表示
        // const axesHelper = new THREE.AxesHelper(5);
        // this.scene.add(axesHelper);
        //ライトの設定
        this.light = new three__WEBPACK_IMPORTED_MODULE_1__.DirectionalLight(0xffffff);
        const lvec = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(1, 1, 1).clone().normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);
        let gui = new lil_gui__WEBPACK_IMPORTED_MODULE_3__.GUI(); // GUI用のインスタンスの生成
        let guiObj = {
            object: "object",
        }; // GUIのパラメータ
        gui.add(guiObj, "object", ["Wave", "Klein", "Perlin"]);
        const clock = new three__WEBPACK_IMPORTED_MODULE_1__.Clock();
        let update = (time) => {
            const deltaTime = clock.getDelta();
            // 座標の更新
            world.fixedStep();
            // for(let i=0; i<this.cubeNum; i++){
            // cubes[i].position.set(cubeBodys[i].position.x, cubeBodys[i].position.y, cubeBodys[i].position.z);
            // cubes[i].quaternion.set(cubeBodys[i].quaternion.x, cubeBodys[i].quaternion.y, cubeBodys[i].quaternion.z, cubeBodys[i].quaternion.w);
            // }
            sphere.position.set(ballBody.position.x, ballBody.position.y, ballBody.position.z);
            sphere.quaternion.set(ballBody.quaternion.x, ballBody.quaternion.y, ballBody.quaternion.z, ballBody.quaternion.w);
            this.goalMesh.position.set(this.goalBody.position.x, this.goalBody.position.y, this.goalBody.position.z);
            this.goalMesh.quaternion.set(this.goalBody.quaternion.x, this.goalBody.quaternion.y, this.goalBody.quaternion.z, this.goalBody.quaternion.w);
            ballBody.addEventListener("collide", (e) => {
                // 衝突相手のボディを取得
                const collidedBody = e.contact.bi.id === ballBody.id
                    ? e.contact.bj
                    : e.contact.bi;
                // planeBodyとの衝突時のみ処理を実行
                if (collidedBody.id === this.stopBody.id || collidedBody.id === this.goalBody.id) {
                    const random = Math.floor(Math.random() * 9) * 2 - 8;
                    sphere.position.z = 0;
                    sphere.position.x = random;
                    sphere.position.y = 4;
                    ballBody.position.x = random;
                    ballBody.position.z = 0;
                    ballBody.position.y = 4;
                    ballBody.velocity.set(0, -5, 0); // 速度をリセット
                    ballBody.angularVelocity.set(0, 0, 0); // 角速度をリセット
                    if (e.body === this.goalBody && !this.isColliding) {
                        this.count++;
                        this.isColliding = true;
                        console.log(this.count);
                        setTimeout(() => {
                            this.isColliding = false;
                        }, this.collisionCooldown);
                    }
                }
            });
            const geom = this.cloud.geometry;
            const positions = geom.getAttribute("position"); // 座標データ
            for (let i = 0; i < this.particleVelocity.length; i++) {
                positions.setX(i, positions.getX(i) + this.particleVelocity[i].x * 100 * deltaTime);
                if (positions.getY(i) + this.particleVelocity[i].y < 0) {
                    positions.setY(i, 20);
                }
                else {
                    positions.setY(i, positions.getY(i) + this.particleVelocity[i].y * 100 * deltaTime);
                }
                positions.setZ(i, positions.getZ(i) + this.particleVelocity[i].z * 100 * deltaTime);
            }
            positions.needsUpdate = true;
            switch (guiObj.object) { // 表示するオブジェクトの設定
                case "Wave":
                    break;
                case "Klein":
                    break;
                case "Perlin":
                    break;
                default:
                    break;
            }
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    };
}
window.addEventListener("DOMContentLoaded", init);
function init() {
    let container = new ThreeJSContainer();
    let viewport = container.createRendererDOM(640, 480, new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(10, 10, 10));
    document.body.appendChild(viewport);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkcgprendering"] = self["webpackChunkcgprendering"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_cannon-es_dist_cannon-es_js-node_modules_lil-gui_dist_lil-gui_esm_js-nod-376d50"], () => (__webpack_require__("./src/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSx1Q0FBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNsRCxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hDO1FBRUQsVUFBVTtRQUNWLE1BQU0sWUFBWSxHQUFHLElBQUksOENBQWlCLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2RCxNQUFNLFlBQVksR0FBRyxJQUFJLG9EQUF1QixDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdEUsTUFBTSxRQUFRLEdBQUcsSUFBSSx1Q0FBVSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM1RCxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFekIsU0FBUztRQUNULE1BQU0sWUFBWSxHQUFHLElBQUksOENBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0RCxNQUFNLFlBQVksR0FBRyxJQUFJLG9EQUF1QixDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLHVDQUFVLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FB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QUUsRUFBRSxFQUFFLENBQUMsQ0FDaEMsQ0FBQztJQUNGLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7Ozs7Ozs7VUN2Y0Q7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOzs7OztXQ3pCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLCtCQUErQix3Q0FBd0M7V0FDdkU7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQkFBaUIscUJBQXFCO1dBQ3RDO1dBQ0E7V0FDQSxrQkFBa0IscUJBQXFCO1dBQ3ZDO1dBQ0E7V0FDQSxLQUFLO1dBQ0w7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7OztXQzNCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsTUFBTSxxQkFBcUI7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7Ozs7O1VFaERBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvLi9zcmMvYXBwLnRzIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gMjJGSTAzOCDlt53ngKzlj4vph4xcblxuaW1wb3J0ICogYXMgQ0FOTk9OIGZyb20gXCJjYW5ub24tZXNcIjtcbmltcG9ydCB7IEdVSSB9IGZyb20gXCJsaWwtZ3VpXCI7XG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmltcG9ydCB7IE9yYml0Q29udHJvbHMgfSBmcm9tIFwidGhyZWUvZXhhbXBsZXMvanNtL2NvbnRyb2xzL09yYml0Q29udHJvbHNcIjtcblxuY2xhc3MgVGhyZWVKU0NvbnRhaW5lciB7XG4gICAgcHJpdmF0ZSBzY2VuZTogVEhSRUUuU2NlbmU7XG4gICAgcHJpdmF0ZSBsaWdodDogVEhSRUUuTGlnaHQ7XG4gICAgcHJpdmF0ZSB3YWxsTnVtOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBwbGFuZUJvZHk6IENBTk5PTi5Cb2R5O1xuICAgIHByaXZhdGUgc3RvcEJvZHk6IENBTk5PTi5Cb2R5O1xuICAgIHByaXZhdGUgZ29hbEJvZHk6IENBTk5PTi5Cb2R5O1xuICAgIHByaXZhdGUgZ29hbE1lc2g6IFRIUkVFLk1lc2g7XG4gICAgcHJpdmF0ZSBjbG91ZDogVEhSRUUuUG9pbnRzO1xuICAgIHByaXZhdGUgcGFydGljbGVWZWxvY2l0eTogVEhSRUUuVmVjdG9yM1tdO1xuICAgIHByaXZhdGUgaXNDb2xsaWRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcbnByaXZhdGUgY29sbGlzaW9uQ29vbGRvd246IG51bWJlciA9IDUwMDtcbiAgICBwcml2YXRlIGdvYWxNb3ZlU3BlZWQ6IG51bWJlciA9IDAuNTtcbiAgICBwcml2YXRlIGNvdW50OiBudW1iZXIgPSAwO1xuXG4gICAgcHJpdmF0ZSBtb3ZlR29hbChkeDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IG5ld1ggPSB0aGlzLmdvYWxCb2R5LnBvc2l0aW9uLnggKyBkeDtcbiAgICAgICAgaWYgKG5ld1ggPiAtMTAgJiYgbmV3WCA8IDEwKSB7ICAvLyDnlLvpnaLjga7nq6/jgpItNuOBi+OCiTbjgajku67lrppcbiAgICAgICAgICAgIHRoaXMuZ29hbEJvZHkucG9zaXRpb24ueCA9IG5ld1g7XG4gICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnBvc2l0aW9uLnggPSBuZXdYO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoKSB7fVxuXG4gICAgLy8g55S76Z2i6YOo5YiG44Gu5L2c5oiQKOihqOekuuOBmeOCi+aeoOOBlOOBqOOBqykqXG4gICAgcHVibGljIGNyZWF0ZVJlbmRlcmVyRE9NID0gKFxuICAgICAgICB3aWR0aDogbnVtYmVyLFxuICAgICAgICBoZWlnaHQ6IG51bWJlcixcbiAgICAgICAgY2FtZXJhUG9zOiBUSFJFRS5WZWN0b3IzXG4gICAgKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbiAgICAgICAgcmVuZGVyZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcihuZXcgVEhSRUUuQ29sb3IoMHg5QkU1REUpKTtcbiAgICAgICAgcmVuZGVyZXIuc2hhZG93TWFwLmVuYWJsZWQgPSB0cnVlOyAvL+OCt+ODo+ODieOCpuODnuODg+ODl+OCkuacieWKueOBq+OBmeOCi1xuXG4gICAgICAgIC8v44Kr44Oh44Op44Gu6Kit5a6aXG4gICAgICAgIGNvbnN0IGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYShcbiAgICAgICAgICAgIDc1LFxuICAgICAgICAgICAgd2lkdGggLyBoZWlnaHQsXG4gICAgICAgICAgICAwLjEsXG4gICAgICAgICAgICAxMDAwXG4gICAgICAgICk7XG4gICAgICAgIGNhbWVyYS5wb3NpdGlvbi5jb3B5KGNhbWVyYVBvcyk7XG4gICAgICAgIGNhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xuXG4gICAgICAgIGNvbnN0IG9yYml0Q29udHJvbHMgPSBuZXcgT3JiaXRDb250cm9scyhjYW1lcmEsIHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlU2NlbmUoKTtcbiAgICAgICAgLy8g5q+O44OV44Os44O844Og44GudXBkYXRl44KS5ZG844KT44Gn77yMcmVuZGVyXG4gICAgICAgIC8vIHJlcWVzdEFuaW1hdGlvbkZyYW1lIOOBq+OCiOOCiuasoeODleODrOODvOODoOOCkuWRvOOBtlxuICAgICAgICBjb25zdCByZW5kZXI6IEZyYW1lUmVxdWVzdENhbGxiYWNrID0gKHRpbWUpID0+IHtcbiAgICAgICAgICAgIG9yYml0Q29udHJvbHMudXBkYXRlKCk7XG5cbiAgICAgICAgICAgIHJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCBjYW1lcmEpO1xuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuXG4gICAgICAgIHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUuY3NzRmxvYXQgPSBcImxlZnRcIjtcbiAgICAgICAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5tYXJnaW4gPSBcIjEwcHhcIjtcbiAgICAgICAgcmV0dXJuIHJlbmRlcmVyLmRvbUVsZW1lbnQ7XG4gICAgfTtcblxuICAgIC8vIOOCt+ODvOODs+OBruS9nOaIkCjlhajkvZPjgacx5ZueKVxuICAgIHByaXZhdGUgY3JlYXRlU2NlbmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcblxuICAgICAgICBsZXQgY3JlYXRlUGFydGljbGVzID0gKCkgPT4ge1xuICAgICAgICAgICAgLy/jgrjjgqrjg6Hjg4jjg6rjga7kvZzmiJBcbiAgICAgICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XG4gICAgICAgICAgICAvL+ODnuODhuODquOCouODq+OBruS9nOaIkFxuICAgICAgICAgICAgY29uc3QgdGV4dHVyZUxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlID0gdGV4dHVyZUxvYWRlci5sb2FkKFwicmFpbmRyb3AucG5nXCIpO1xuICAgICAgICAgICAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe1xuICAgICAgICAgICAgICAgIHNpemU6IDEsXG4gICAgICAgICAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICAgICAgICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICAgICAgICAgICAgICAgIGNvbG9yOiAweGZmZmZmZixcbiAgICAgICAgICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vcGFydGljbGXjga7kvZzmiJBcbiAgICAgICAgICAgIGNvbnN0IHBhcnRpY2xlTnVtID0gMTAwOyAvLyDjg5Hjg7zjg4bjgqPjgq/jg6vjga7mlbBcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVOdW0gKiAzKTtcbiAgICAgICAgICAgIGxldCBwYXJ0aWNsZUluZGV4ID0gMDtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVWZWxvY2l0eSA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0aWNsZU51bTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25zW3BhcnRpY2xlSW5kZXgrK10gPSBNYXRoLnJhbmRvbSgpICogMzAgLSAxNTsgLy8geOW6p+aomVxuICAgICAgICAgICAgICAgIHBvc2l0aW9uc1twYXJ0aWNsZUluZGV4KytdID0gTWF0aC5yYW5kb20oKSAqIDMwOyAvLyB55bqn5qiZXG4gICAgICAgICAgICAgICAgcG9zaXRpb25zW3BhcnRpY2xlSW5kZXgrK10gPSBNYXRoLnJhbmRvbSgpICogMzAgLSAxNTsgLy8geuW6p+aomVxuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVWZWxvY2l0eS5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBuZXcgVEhSRUUuVmVjdG9yMygwLCAtMC4zICogTWF0aC5yYW5kb20oKSAtIDAuMDUsIDApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgIFwicG9zaXRpb25cIixcbiAgICAgICAgICAgICAgICBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9ucywgMylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvL1RIUkVFLlBvaW50c+OBruS9nOaIkFxuICAgICAgICAgICAgdGhpcy5jbG91ZCA9IG5ldyBUSFJFRS5Qb2ludHMoZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgICAgIC8v44K344O844Oz44G444Gu6L+95YqgXG4gICAgICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmNsb3VkKTtcbiAgICAgICAgfTtcbiAgICAgICAgY3JlYXRlUGFydGljbGVzKCk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdBcnJvd0xlZnQnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVHb2FsKC10aGlzLmdvYWxNb3ZlU3BlZWQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlR29hbCh0aGlzLmdvYWxNb3ZlU3BlZWQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g54mp55CG56m66ZaT44Gu6Kit5a6aXG4gICAgICAgIGNvbnN0IHdvcmxkID0gbmV3IENBTk5PTi5Xb3JsZCh7XG4gICAgICAgICAgICBncmF2aXR5OiBuZXcgQ0FOTk9OLlZlYzMoMCwgLTkuODIsIDApLFxuICAgICAgICB9KTtcbiAgICAgICAgd29ybGQuZGVmYXVsdENvbnRhY3RNYXRlcmlhbC5mcmljdGlvbiA9IDAuMDtcbiAgICAgICAgd29ybGQuZGVmYXVsdENvbnRhY3RNYXRlcmlhbC5yZXN0aXR1dGlvbiA9IDAuMDtcblxuICAgICAgICAvLyBsZXQgY3ViZUJvZHlzOiBDQU5OT04uQm9keVtdID0gW107XG4gICAgICAgIC8vIC8vIOeJqeeQhuepuumWkyBCb3jjga7kvZzmiJBcbiAgICAgICAgLy8gdGhpcy5jdWJlTnVtID0gNTA7XG4gICAgICAgIC8vIGZvcihsZXQgaT0wOyBpPHRoaXMuY3ViZU51bTsgaSsrKXtcbiAgICAgICAgLy8gY29uc3QgY3ViZVNoYXBlID0gbmV3IENBTk5PTi5Cb3gobmV3IENBTk5PTi5WZWMzKDAuMzUsIDAuNSwgMC4xKSk7XG4gICAgICAgIC8vIGNvbnN0IGN1YmVNYXRlcmlhbCA9IG5ldyBDQU5OT04uTWF0ZXJpYWwoeyBmcmljdGlvbjogMC4wMiwgcmVzdGl0dXRpb246IDAuMCB9KTtcbiAgICAgICAgLy8gY3ViZUJvZHlzW2ldID0gbmV3IENBTk5PTi5Cb2R5KHsgbWFzczogMSAsIG1hdGVyaWFsOiBjdWJlTWF0ZXJpYWwgfSk7XG4gICAgICAgIC8vIGN1YmVCb2R5c1tpXS5hZGRTaGFwZShjdWJlU2hhcGUpO1xuXG4gICAgICAgIC8vIH1cblxuICAgICAgICBsZXQgd2FsbEJvZHlzOiBDQU5OT04uQm9keVtdID0gW107XG4gICAgICAgIC8vIOeJqeeQhuepuumWkyDlo4Hjga7kvZzmiJBcbiAgICAgICAgdGhpcy53YWxsTnVtID05O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMud2FsbE51bTsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB3YWxsU2hhcGVzID0gbmV3IENBTk5PTi5Cb3gobmV3IENBTk5PTi5WZWMzKDAuMzUsIDAuNSwgMC4xKSk7XG4gICAgICAgICAgICB3YWxsQm9keXNbaV0gPSBuZXcgQ0FOTk9OLkJvZHkoeyBtYXNzOiAwIH0pO1xuICAgICAgICAgICAgd2FsbEJvZHlzW2ldLmFkZFNoYXBlKHdhbGxTaGFwZXMpO1xuICAgICAgICB9XG4gICAgICAgICAgICBcblxuICAgICAgICAvLyDniannkIbnqbrplpMg5q2i44G+44KL5aOB44Gu5L2c5oiQXG4gICAgICAgIGNvbnN0IHN0b3BTaGFwZSA9IG5ldyBDQU5OT04uQm94KG5ldyBDQU5OT04uVmVjMygxMCwgMS41LCAwLjMpKTtcbiAgICAgICAgdGhpcy5zdG9wQm9keSA9IG5ldyBDQU5OT04uQm9keSh7IG1hc3M6IDAgfSk7XG4gICAgICAgIHRoaXMuc3RvcEJvZHkuYWRkU2hhcGUoc3RvcFNoYXBlKTtcblxuICAgICAgICAvLyDniannkIbnqbrplpMg44K044O844Or44Gu5L2c5oiQXG4gICAgICAgIGNvbnN0IGdvYWxTaGFwZSA9IG5ldyBDQU5OT04uQm94KG5ldyBDQU5OT04uVmVjMygxLCAxLjUsIDAuMykpO1xuICAgICAgICB0aGlzLmdvYWxCb2R5ID0gbmV3IENBTk5PTi5Cb2R5KHsgbWFzczogMCB9KTtcbiAgICAgICAgdGhpcy5nb2FsQm9keS5hZGRTaGFwZShnb2FsU2hhcGUpO1xuXG4gICAgICAgIC8vIOeJqeeQhuepuumWkyBQbGFuZeOBruS9nOaIkFxuICAgICAgICBjb25zdCBwbGFuZVNoYXBlID0gbmV3IENBTk5PTi5QbGFuZSgpO1xuICAgICAgICB0aGlzLnBsYW5lQm9keSA9IG5ldyBDQU5OT04uQm9keSh7IG1hc3M6IDAgfSk7XG4gICAgICAgIHRoaXMucGxhbmVCb2R5LmFkZFNoYXBlKHBsYW5lU2hhcGUpO1xuXG4gICAgICAgIC8vIOeJqeeQhuepuumWkyDjg5zjg7zjg6vjga7kvZzmiJBcbiAgICAgICAgY29uc3QgYmFsbFNoYXBlID0gbmV3IENBTk5PTi5TcGhlcmUoMC40KTtcbiAgICAgICAgY29uc3QgYmFsbEJvZHkgPSBuZXcgQ0FOTk9OLkJvZHkoeyBtYXNzOiAxIH0pO1xuICAgICAgICBiYWxsQm9keS5hZGRTaGFwZShiYWxsU2hhcGUpO1xuXG4gICAgICAgIC8vIEJveOOBruS9nOaIkFxuICAgICAgICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSgwLjcsIDEsIDAuMik7XG4gICAgICAgIGNvbnN0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgY29sb3I6IDB4RTU5QkRBIH0pO1xuICAgICAgICAvLyBmb3IobGV0IGk9MDsgaTx0aGlzLmN1YmVOdW07IGkrKyl7XG4gICAgICAgIC8vICAgICBjb25zdCByYWRpdXMgPSA2O1xuICAgICAgICAvLyAgICAgY29uc3QgdGhldGEgPSBNYXRoLlBJICogMiAqIGkgLyB0aGlzLmN1YmVOdW07XG4gICAgICAgIC8vICAgICBjb25zdCBjaXJjbGVYID0gcmFkaXVzICogTWF0aC5jb3ModGhldGEpO1xuICAgICAgICAvLyAgICAgY29uc3QgY2lyY2xlWiA9IHJhZGl1cyAqIE1hdGguc2luKHRoZXRhKTtcbiAgICAgICAgLy8gY3ViZXNbaV0gPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgICAgICAvLyBjdWJlc1tpXS5wb3NpdGlvbi54ID0gY2lyY2xlWDtcbiAgICAgICAgLy8gY3ViZXNbaV0ucG9zaXRpb24ueSA9IDU7XG4gICAgICAgIC8vIGN1YmVzW2ldLnBvc2l0aW9uLnogPSBjaXJjbGVaO1xuICAgICAgICAvLyBjdWJlc1tpXS5yb3RhdGlvbi55ID0gLSBNYXRoLlBJICogMiAqIGkgLyB0aGlzLmN1YmVOdW07XG4gICAgICAgIC8vIGlmKGkgPT09IDApe1xuICAgICAgICAvLyBjdWJlc1tpXS5yb3RhdGlvbi54ID0gMC41O1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIHRoaXMuc2NlbmUuYWRkKGN1YmVzW2ldKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGxldCB3YWxsTWVzaHM6IFRIUkVFLk1lc2hbXSA9IFtdO1xuXG4gICAgICAgIC8vIOWjgeOBruS9nOaIkFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMud2FsbE51bTsgaSsrKSB7XG4gICAgICAgICAgICB3YWxsTWVzaHNbaV0gPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgICAgICAgICAgd2FsbE1lc2hzW2ldLnBvc2l0aW9uLnkgPSAyO1xuICAgICAgICAgICAgd2FsbE1lc2hzW2ldLnBvc2l0aW9uLnggPSAyICogaSAtIDg7XG4gICAgICAgICAgICB3YWxsTWVzaHNbaV0ucm90YXRpb24ueCA9IE1hdGguUEkgLyAyIC0gNDA7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLmFkZCh3YWxsTWVzaHNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5q2i44G+44KL5aOB44Gu5L2c5oiQXG4gICAgICAgIGNvbnN0IHN0b3BHZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSgyMCwgMywgMC42KTtcbiAgICAgICAgY29uc3Qgc3RvcE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgY29sb3I6IDB4RTU5QkRBIH0pO1xuICAgICAgICBjb25zdCBzdG9wTWVzaCA9IG5ldyBUSFJFRS5NZXNoKHN0b3BHZW9tZXRyeSwgc3RvcE1hdGVyaWFsKTtcbiAgICAgICAgc3RvcE1lc2gucG9zaXRpb24uej0gMTA7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHN0b3BNZXNoKTtcblxuICAgICAgICAvLyDjgrTjg7zjg6vjga7kvZzmiJBcbiAgICAgICAgY29uc3QgZ29hbEdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDIsIDMsIDAuNik7XG4gICAgICAgIGNvbnN0IGdvYWxNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7IGNvbG9yOiAweGQyYjQ4YyB9KTtcbiAgICAgICAgdGhpcy5nb2FsTWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdvYWxHZW9tZXRyeSwgZ29hbE1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5nb2FsTWVzaC5wb3NpdGlvbi56PSA4O1xuICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmdvYWxNZXNoKTtcblxuXG4gICAgICAgIC8vIFBsYW5l44Gu5L2c5oiQXG4gICAgICAgIGNvbnN0IHBob25nTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBjb2xvcjogMHhFNURFOUIgfSk7XG4gICAgICAgIGNvbnN0IHBsYW5lR2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgyNSwgMjUpO1xuICAgICAgICBjb25zdCBwbGFuZU1lc2ggPSBuZXcgVEhSRUUuTWVzaChwbGFuZUdlb21ldHJ5LCBwaG9uZ01hdGVyaWFsKTtcbiAgICAgICAgcGxhbmVNZXNoLm1hdGVyaWFsLnNpZGUgPSBUSFJFRS5Eb3VibGVTaWRlOyAvLyDkuKHpnaJcbiAgICAgICAgcGxhbmVNZXNoLnJvdGF0ZVgoLU1hdGguUEkgLyAyKTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQocGxhbmVNZXNoKTtcblxuICAgICAgICAvLyDjg5zjg7zjg6vjga7kvZzmiJBcbiAgICAgICAgY29uc3QgYmFsbEdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNCwgMzIsIDE2KTtcbiAgICAgICAgY29uc3QgYmFsbE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hOb3JtYWxNYXRlcmlhbCgpO1xuICAgICAgICBjb25zdCBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChiYWxsR2VvbWV0cnksIGJhbGxNYXRlcmlhbCk7XG4gICAgICAgIHNwaGVyZS5wb3NpdGlvbi55ID0gNDtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQoc3BoZXJlKTtcblxuICAgICAgICAvLyBCb3gg57SQ44Gl44GRXG4gICAgICAgIC8vIGZvcihsZXQgaT0wOyBpPHRoaXMuY3ViZU51bTsgaSsrKXtcbiAgICAgICAgLy8gY3ViZUJvZHlzW2ldLnBvc2l0aW9uLnNldChjdWJlc1tpXS5wb3NpdGlvbi54LCBjdWJlc1tpXS5wb3NpdGlvbi55LCBjdWJlc1tpXS5wb3NpdGlvbi56KTtcbiAgICAgICAgLy8gY3ViZUJvZHlzW2ldLnF1YXRlcm5pb24uc2V0KGN1YmVzW2ldLnF1YXRlcm5pb24ueCwgY3ViZXNbaV0ucXVhdGVybmlvbi55LCBjdWJlc1tpXS5xdWF0ZXJuaW9uLnosIGN1YmVzW2ldLnF1YXRlcm5pb24udyk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMud2FsbE51bTsgaSsrKSB7XG4gICAgICAgICAgICAvLyDlo4Eg57SQ44Gl44GRXG4gICAgICAgICAgICB3YWxsQm9keXNbaV0ucG9zaXRpb24uc2V0KFxuICAgICAgICAgICAgICAgIHdhbGxNZXNoc1tpXS5wb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgIHdhbGxNZXNoc1tpXS5wb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgIHdhbGxNZXNoc1tpXS5wb3NpdGlvbi56XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgd2FsbEJvZHlzW2ldLnF1YXRlcm5pb24uc2V0KFxuICAgICAgICAgICAgICAgIHdhbGxNZXNoc1tpXS5xdWF0ZXJuaW9uLngsXG4gICAgICAgICAgICAgICAgd2FsbE1lc2hzW2ldLnF1YXRlcm5pb24ueSxcbiAgICAgICAgICAgICAgICB3YWxsTWVzaHNbaV0ucXVhdGVybmlvbi56LFxuICAgICAgICAgICAgICAgIHdhbGxNZXNoc1tpXS5xdWF0ZXJuaW9uLndcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmraLjgb7jgovlo4Eg57SQ44Gl44GRXG4gICAgICAgIHRoaXMuc3RvcEJvZHkucG9zaXRpb24uc2V0KFxuICAgICAgICAgICAgc3RvcE1lc2gucG9zaXRpb24ueCxcbiAgICAgICAgICAgIHN0b3BNZXNoLnBvc2l0aW9uLnksXG4gICAgICAgICAgICBzdG9wTWVzaC5wb3NpdGlvbi56XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuc3RvcEJvZHkucXVhdGVybmlvbi5zZXQoXG4gICAgICAgICAgICBzdG9wTWVzaC5xdWF0ZXJuaW9uLngsXG4gICAgICAgICAgICBzdG9wTWVzaC5xdWF0ZXJuaW9uLnksXG4gICAgICAgICAgICBzdG9wTWVzaC5xdWF0ZXJuaW9uLnosXG4gICAgICAgICAgICBzdG9wTWVzaC5xdWF0ZXJuaW9uLndcbiAgICAgICAgKTtcblxuICAgICAgICAgLy8g44K044O844OrIOe0kOOBpeOBkVxuICAgICAgICAgdGhpcy5nb2FsQm9keS5wb3NpdGlvbi5zZXQoXG4gICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnBvc2l0aW9uLngsXG4gICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnBvc2l0aW9uLnksXG4gICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnBvc2l0aW9uLnpcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5nb2FsQm9keS5xdWF0ZXJuaW9uLnNldChcbiAgICAgICAgICAgIHRoaXMuZ29hbE1lc2gucXVhdGVybmlvbi54LFxuICAgICAgICAgICAgdGhpcy5nb2FsTWVzaC5xdWF0ZXJuaW9uLnksXG4gICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnF1YXRlcm5pb24ueixcbiAgICAgICAgICAgIHRoaXMuZ29hbE1lc2gucXVhdGVybmlvbi53XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gcGxhbmUg57SQ44Gl44GRXG4gICAgICAgIHRoaXMucGxhbmVCb2R5LnBvc2l0aW9uLnNldChcbiAgICAgICAgICAgIHBsYW5lTWVzaC5wb3NpdGlvbi54LFxuICAgICAgICAgICAgcGxhbmVNZXNoLnBvc2l0aW9uLnksXG4gICAgICAgICAgICBwbGFuZU1lc2gucG9zaXRpb24uelxuICAgICAgICApO1xuICAgICAgICB0aGlzLnBsYW5lQm9keS5xdWF0ZXJuaW9uLnNldChcbiAgICAgICAgICAgIHBsYW5lTWVzaC5xdWF0ZXJuaW9uLngsXG4gICAgICAgICAgICBwbGFuZU1lc2gucXVhdGVybmlvbi55LFxuICAgICAgICAgICAgcGxhbmVNZXNoLnF1YXRlcm5pb24ueixcbiAgICAgICAgICAgIHBsYW5lTWVzaC5xdWF0ZXJuaW9uLndcbiAgICAgICAgKTtcblxuICAgICAgICAvLyDjg5zjg7zjg6sg57SQ44Gl44GRXG4gICAgICAgIGJhbGxCb2R5LnBvc2l0aW9uLnNldChcbiAgICAgICAgICAgIHNwaGVyZS5wb3NpdGlvbi54LFxuICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnksXG4gICAgICAgICAgICBzcGhlcmUucG9zaXRpb24uelxuICAgICAgICApO1xuICAgICAgICBiYWxsQm9keS5xdWF0ZXJuaW9uLnNldChcbiAgICAgICAgICAgIHNwaGVyZS5xdWF0ZXJuaW9uLngsXG4gICAgICAgICAgICBzcGhlcmUucXVhdGVybmlvbi55LFxuICAgICAgICAgICAgc3BoZXJlLnF1YXRlcm5pb24ueixcbiAgICAgICAgICAgIHNwaGVyZS5xdWF0ZXJuaW9uLndcbiAgICAgICAgKTtcblxuICAgICAgICAvLyDov73liqBcbiAgICAgICAgd29ybGQuYWRkQm9keSh0aGlzLnBsYW5lQm9keSk7XG4gICAgICAgIC8vIGZvcihsZXQgaT0wOyBpPHRoaXMuY3ViZU51bTsgaSsrKXtcbiAgICAgICAgLy8gd29ybGQuYWRkQm9keShjdWJlQm9keXNbaV0pO1xuICAgICAgICAvLyB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy53YWxsTnVtOyBpKyspIHtcbiAgICAgICAgICAgIHdvcmxkLmFkZEJvZHkod2FsbEJvZHlzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICB3b3JsZC5hZGRCb2R5KGJhbGxCb2R5KTtcbiAgICAgICAgd29ybGQuYWRkQm9keSh0aGlzLnN0b3BCb2R5KTtcbiAgICAgICAgd29ybGQuYWRkQm9keSh0aGlzLmdvYWxCb2R5KTtcblxuICAgICAgICAvLyAvLyDjgrDjg6rjg4Pjg4nooajnpLpcbiAgICAgICAgLy8gY29uc3QgZ3JpZEhlbHBlciA9IG5ldyBUSFJFRS5HcmlkSGVscGVyKDEwKTtcbiAgICAgICAgLy8gdGhpcy5zY2VuZS5hZGQoZ3JpZEhlbHBlcik7XG5cbiAgICAgICAgLy8gLy8g6Lu46KGo56S6XG4gICAgICAgIC8vIGNvbnN0IGF4ZXNIZWxwZXIgPSBuZXcgVEhSRUUuQXhlc0hlbHBlcig1KTtcbiAgICAgICAgLy8gdGhpcy5zY2VuZS5hZGQoYXhlc0hlbHBlcik7XG5cbiAgICAgICAgLy/jg6njgqTjg4jjga7oqK3lrppcbiAgICAgICAgdGhpcy5saWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmKTtcbiAgICAgICAgY29uc3QgbHZlYyA9IG5ldyBUSFJFRS5WZWN0b3IzKDEsIDEsIDEpLm5vcm1hbGl6ZSgpO1xuICAgICAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnNldChsdmVjLngsIGx2ZWMueSwgbHZlYy56KTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5saWdodCk7XG5cbiAgICAgICAgXG4gICAgICAgIGxldCBndWkgPSBuZXcgR1VJKCk7IC8vIEdVSeeUqOOBruOCpOODs+OCueOCv+ODs+OCueOBrueUn+aIkFxuICAgICAgICBsZXQgZ3VpT2JqID0ge1xuICAgICAgICAgICAgb2JqZWN0OiBcIm9iamVjdFwiLFxuICAgICAgICB9OyAvLyBHVUnjga7jg5Hjg6njg6Hjg7zjgr9cbiAgICAgICAgZ3VpLmFkZChndWlPYmosIFwib2JqZWN0XCIsIFtcIldhdmVcIiwgXCJLbGVpblwiLCBcIlBlcmxpblwiXSk7XG5cbiAgICAgICAgY29uc3QgY2xvY2sgPSBuZXcgVEhSRUUuQ2xvY2soKTtcbiAgICAgICAgbGV0IHVwZGF0ZTogRnJhbWVSZXF1ZXN0Q2FsbGJhY2sgPSAodGltZSkgPT4ge1xuICAgICAgICBjb25zdCBkZWx0YVRpbWUgPSBjbG9jay5nZXREZWx0YSgpO1xuICAgICAgICAgICAgLy8g5bqn5qiZ44Gu5pu05pawXG4gICAgICAgICAgICB3b3JsZC5maXhlZFN0ZXAoKTtcbiAgICAgICAgICAgIC8vIGZvcihsZXQgaT0wOyBpPHRoaXMuY3ViZU51bTsgaSsrKXtcbiAgICAgICAgICAgIC8vIGN1YmVzW2ldLnBvc2l0aW9uLnNldChjdWJlQm9keXNbaV0ucG9zaXRpb24ueCwgY3ViZUJvZHlzW2ldLnBvc2l0aW9uLnksIGN1YmVCb2R5c1tpXS5wb3NpdGlvbi56KTtcbiAgICAgICAgICAgIC8vIGN1YmVzW2ldLnF1YXRlcm5pb24uc2V0KGN1YmVCb2R5c1tpXS5xdWF0ZXJuaW9uLngsIGN1YmVCb2R5c1tpXS5xdWF0ZXJuaW9uLnksIGN1YmVCb2R5c1tpXS5xdWF0ZXJuaW9uLnosIGN1YmVCb2R5c1tpXS5xdWF0ZXJuaW9uLncpO1xuICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICBzcGhlcmUucG9zaXRpb24uc2V0KFxuICAgICAgICAgICAgICAgIGJhbGxCb2R5LnBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgYmFsbEJvZHkucG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICBiYWxsQm9keS5wb3NpdGlvbi56XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgc3BoZXJlLnF1YXRlcm5pb24uc2V0KFxuICAgICAgICAgICAgICAgIGJhbGxCb2R5LnF1YXRlcm5pb24ueCxcbiAgICAgICAgICAgICAgICBiYWxsQm9keS5xdWF0ZXJuaW9uLnksXG4gICAgICAgICAgICAgICAgYmFsbEJvZHkucXVhdGVybmlvbi56LFxuICAgICAgICAgICAgICAgIGJhbGxCb2R5LnF1YXRlcm5pb24ud1xuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgdGhpcy5nb2FsTWVzaC5wb3NpdGlvbi5zZXQoXG4gICAgICAgICAgICAgICAgdGhpcy5nb2FsQm9keS5wb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgIHRoaXMuZ29hbEJvZHkucG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICB0aGlzLmdvYWxCb2R5LnBvc2l0aW9uLnpcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnF1YXRlcm5pb24uc2V0KFxuICAgICAgICAgICAgICAgIHRoaXMuZ29hbEJvZHkucXVhdGVybmlvbi54LFxuICAgICAgICAgICAgICAgIHRoaXMuZ29hbEJvZHkucXVhdGVybmlvbi55LFxuICAgICAgICAgICAgICAgIHRoaXMuZ29hbEJvZHkucXVhdGVybmlvbi56LFxuICAgICAgICAgICAgICAgIHRoaXMuZ29hbEJvZHkucXVhdGVybmlvbi53XG4gICAgICAgICAgICApO1xuXG5cbiAgICAgICAgICAgIGJhbGxCb2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJjb2xsaWRlXCIsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8g6KGd56qB55u45omL44Gu44Oc44OH44Kj44KS5Y+W5b6XXG4gICAgICAgICAgICAgICAgY29uc3QgY29sbGlkZWRCb2R5ID1cbiAgICAgICAgICAgICAgICAgICAgZS5jb250YWN0LmJpLmlkID09PSBiYWxsQm9keS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBlLmNvbnRhY3QuYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIDogZS5jb250YWN0LmJpO1xuXG4gICAgICAgICAgICAgICAgLy8gcGxhbmVCb2R544Go44Gu6KGd56qB5pmC44Gu44G/5Yem55CG44KS5a6f6KGMXG4gICAgICAgICAgICAgICAgaWYgKGNvbGxpZGVkQm9keS5pZCA9PT0gdGhpcy5zdG9wQm9keS5pZCB8fCBjb2xsaWRlZEJvZHkuaWQgPT09IHRoaXMuZ29hbEJvZHkuaWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhbmRvbSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDkpICogMiAtIDg7XG4gICAgICAgICAgICAgICAgICAgIHNwaGVyZS5wb3NpdGlvbi56ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnggPSByYW5kb207XG4gICAgICAgICAgICAgICAgICAgIHNwaGVyZS5wb3NpdGlvbi55ID0gNDtcbiAgICAgICAgICAgICAgICAgICAgYmFsbEJvZHkucG9zaXRpb24ueCA9IHJhbmRvbTtcbiAgICAgICAgICAgICAgICAgICAgYmFsbEJvZHkucG9zaXRpb24ueiA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGJhbGxCb2R5LnBvc2l0aW9uLnkgPSA0O1xuICAgICAgICAgICAgICAgICAgICBiYWxsQm9keS52ZWxvY2l0eS5zZXQoMCwgLTUsIDApOyAvLyDpgJ/luqbjgpLjg6rjgrvjg4Pjg4hcbiAgICAgICAgICAgICAgICAgICAgYmFsbEJvZHkuYW5ndWxhclZlbG9jaXR5LnNldCgwLCAwLCAwKTsgLy8g6KeS6YCf5bqm44KS44Oq44K744OD44OIXG4gICAgICAgICAgICAgICAgICAgIGlmIChlLmJvZHkgPT09IHRoaXMuZ29hbEJvZHkgJiYgIXRoaXMuaXNDb2xsaWRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ29sbGlkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NvbGxpZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzLmNvbGxpc2lvbkNvb2xkb3duKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGdlb20gPSA8VEhSRUUuQnVmZmVyR2VvbWV0cnk+dGhpcy5jbG91ZC5nZW9tZXRyeTtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IGdlb20uZ2V0QXR0cmlidXRlKFwicG9zaXRpb25cIik7IC8vIOW6p+aomeODh+ODvOOCv1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlVmVsb2NpdHkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbnMuc2V0WChcbiAgICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zLmdldFgoaSkgKyB0aGlzLnBhcnRpY2xlVmVsb2NpdHlbaV0ueCAqIDEwMCAqIGRlbHRhVGltZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9ucy5nZXRZKGkpICsgdGhpcy5wYXJ0aWNsZVZlbG9jaXR5W2ldLnkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucy5zZXRZKGksIDIwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMuc2V0WShcbiAgICAgICAgICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMuZ2V0WShpKSArIHRoaXMucGFydGljbGVWZWxvY2l0eVtpXS55ICogMTAwICogZGVsdGFUaW1lXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBvc2l0aW9ucy5zZXRaKFxuICAgICAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMuZ2V0WihpKSArIHRoaXMucGFydGljbGVWZWxvY2l0eVtpXS56ICogMTAwICogZGVsdGFUaW1lXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcG9zaXRpb25zLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICAgICAgc3dpdGNoIChndWlPYmoub2JqZWN0KSB7IC8vIOihqOekuuOBmeOCi+OCquODluOCuOOCp+OCr+ODiOOBruioreWumlxuICAgICAgICAgICAgICAgIGNhc2UgXCJXYXZlXCI6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJLbGVpblwiOlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiUGVybGluXCI6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZSk7XG4gICAgfTtcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGluaXQpO1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIGxldCBjb250YWluZXIgPSBuZXcgVGhyZWVKU0NvbnRhaW5lcigpO1xuXG4gICAgbGV0IHZpZXdwb3J0ID0gY29udGFpbmVyLmNyZWF0ZVJlbmRlcmVyRE9NKFxuICAgICAgICA2NDAsXG4gICAgICAgIDQ4MCxcbiAgICAgICAgbmV3IFRIUkVFLlZlY3RvcjMoMTAsIDEwLCAxMClcbiAgICApO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodmlld3BvcnQpO1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIFtjaHVua0lkcywgZm4sIHByaW9yaXR5XSA9IGRlZmVycmVkW2ldO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwibWFpblwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtjZ3ByZW5kZXJpbmdcIl0gPSBzZWxmW1wid2VicGFja0NodW5rY2dwcmVuZGVyaW5nXCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGRlcGVuZHMgb24gb3RoZXIgbG9hZGVkIGNodW5rcyBhbmQgZXhlY3V0aW9uIG5lZWQgdG8gYmUgZGVsYXllZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJ2ZW5kb3JzLW5vZGVfbW9kdWxlc19jYW5ub24tZXNfZGlzdF9jYW5ub24tZXNfanMtbm9kZV9tb2R1bGVzX2xpbC1ndWlfZGlzdF9saWwtZ3VpX2VzbV9qcy1ub2QtMzc2ZDUwXCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2FwcC50c1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
const { readdirSync, lstatSync, unlinkSync, readFileSync, writeFileSync } = require('fs');
const { exec, execSync } = require('child_process');

exec('yarn build', {}, async (err, stout) => {
    console.log(stout);
    exec('git checkout -B gh-pages', {}, (err, branch_stdout) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(branch_stdout);

        const files = readdirSync('./');
        files.forEach(each => {
            if (each !== 'build' && each !== 'prepare-build.js' && each.indexOf('.git') !== 0 && each !== 'node_modules') {
                if (lstatSync(each).isDirectory()) {
                    console.log('Removing directory ['+ each + ']')
                    execSync(`rm -rf ${each}`);
                } else {
                    console.log('Removing file ['+each +']')
                    unlinkSync(each)
                }
            }
        });
        readdirSync('./build').forEach(each => {
            console.log(`Coping file [build/${each}] to [${each}]`)
            // if (!lstatSync(each).isDirectory()) copyFileSync('./build/' +each, each);
            execSync(`cp -R ./build/${each} ${each}`)
        });

        const indexHtml = readFileSync('index.html', { encoding: 'utf8' })
        .replace(/href="\//g, 'href="')
        .replace(/src="\//g, 'src="');
        writeFileSync('index.html', indexHtml);

        exec('git add .', {}, (err, commit_stdout) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(commit_stdout);
            execSync('git commit -m "prepared build and release"');
            execSync('git push origin gh-pages -f');
            exec('git checkout master', {}, (err, checkout_stdout) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(checkout_stdout); 
            });
        });
    });
});
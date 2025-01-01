const Discord = require('discord.js-selfbot-v13');
const readline = require('readline');
const gradient = require('gradient-string');
const figlet = require('figlet');
const chalk = require('chalk');

// Feito por Future
const dependencies = {
    "gradient-string": "^2.0.2",
    "figlet": "^1.5.2",
    "chalk": "^4.1.2"
};

const client = new Discord.Client({
    checkUpdate: false,
    ws: {
        properties: {
            browser: "Discord Client",
            os: "Windows"
        }
    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let antiDMActive = false;
let token = null;
let config = {
    delayBetweenActions: 1000,
    showNotifications: true,
    autoReconnect: true,
    safeMode: true 
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function showLoadingAnimation() {
    const frames = [
        `
                ╔══════════════════════════════════════════════════════╗
                ║                                                      ║
                ║        ╭━━━━╮      Loading...      ╭━━━━╮          ║
                ║        ┃ ╭╮ ┃     ▰▰▰▰▱▱▱▱▱▱      ┃ ╭╮ ┃          ║
                ║        ┃ ╰╯ ┃                      ┃ ╰╯ ┃          ║
                ║        ╰━━━━╯                      ╰━━━━╯          ║
                ║                                                      ║
                ╚══════════════════════════════════════════════════════╝`,
        `
                ╔══════════════════════════════════════════════════════╗
                ║                                                      ║
                ║        ╭━━━━╮      Loading...      ╭━━━━╮          ║
                ║        ┃ ╭╮ ┃     ▰▰▰▰▱▱▱▱▱▱      ┃ ╭╮ ┃          ║
                ║        ┃ ╰╯ ┃                      ┃ ╰╯ ┃          ║
                ║        ╰━━━━╯                      ╰━━━━╯          ║
                ║                                                      ║
                ╚══════════════════════════════════════════════════════╝`,
        `
                ╔══════════════════════════════════════════════════════╗
                ║                                                      ║
                ║        ╭━━━━╮      Loading...      ╭━━━━╮          ║
                ║        ┃ ╭╮ ┃     ▰▰▰▰▱▱▱▱▱▱      ┃ ╭╮ ┃          ║
                ║        ┃ ╰╯ ┃                      ┃ ╰╯ ┃          ║
                ║        ╰━━━━╯                      ╰━━━━╯          ║
                ║                                                      ║
                ╚══════════════════════════════════════════════════════╝`
    ];

    const loadingTexts = [
        'Iniciando sistemas...',
        'Carregando módulos...',
        'Verificando conexão...',
        'Quase pronto...'
    ];

    let i = 0;
    const colors = ['cyan', 'magenta', 'blue', 'green', 'yellow'];
    
    while(i < 15) {
        console.clear();
        const loadingText = loadingTexts[Math.floor(i/4) % loadingTexts.length];
        console.log('\n\n');
        console.log(chalk[colors[i % colors.length]](frames[i % frames.length]));
        console.log(chalk.cyan(`\n                      ${loadingText}`));
        await sleep(200);
        i++;
    }
    console.clear();
}

function showTitle() {
    return new Promise((resolve) => {
        figlet.text('FUTURE', {
            font: 'ANSI Shadow',
            horizontalLayout: 'fitted',
            verticalLayout: 'fitted',
            width: 120,
            whitespaceBreak: true
        }, function(err, data) {
            if (err) {
                console.log('Algo deu errado...');
                return;
            }
            console.log('\n\n');
            console.log(gradient.pastel.multiline(center(data)));
            console.log(chalk.cyan(center('═══════════════════════════════════════════════')));
            console.log(chalk.cyan(center('           Multi-Tools Discord by Future v1.0  ')));
            console.log(chalk.cyan(center('═══════════════════════════════════════════════')));
            resolve();
        });
    });
}


function center(text) {
    const lines = text.split('\n');
    const maxLength = Math.max(...lines.map(line => line.length));
    const padding = ' '.repeat(Math.floor((process.stdout.columns - maxLength) / 2));
    return lines.map(line => padding + line).join('\n');
}

async function showWelcome() {
    console.clear();
    await showTitle();
    
    console.log(chalk.cyan('\n    ═══════════════════ Multi-Tools Discord by Future ═══════════════════\n'));
    
    const options = [
        '🗑️  Limpar DM com usuário específico',
        '👥 Remover todos os amigos',
        '🛡️  Ativar/Desativar Anti-DM',
        '🔄 Mover usuários entre calls',
        '⚙️  Configurações',
        '❌ Sair'
    ];

    options.forEach((option, index) => {
        console.log(chalk.yellow(`    [${index + 1}] ${option}`));
    });
    
    console.log(chalk.cyan('\n    ═══════════════════════════════════════════════════════════\n'));
    
    if (client.user) {
        console.log(chalk.green(`    🟢 Logado como: ${client.user.tag}`));
    }
    
    console.log(chalk.gray(`    📊 Status: ${antiDMActive ? 'Anti-DM Ativo' : 'Anti-DM Inativo'}\n`));
    
    rl.question(chalk.white('    Escolha uma opção: '), (option) => {
        handleOption(option);
    });
}

async function authenticateUser(callback) {
    console.clear();
    await showTitle();
    console.log(chalk.cyan('\n    ═══════════════════ Autenticação Discord ═══════════════════\n'));
    
    if (!token) {
        console.log(chalk.yellow('    ℹ️  Para obter seu token:'));
        console.log(chalk.gray('    1. Abra o Discord no navegador'));
        console.log(chalk.gray('    2. Pressione F12 para abrir o DevTools'));
        console.log(chalk.gray('    3. Vá para a aba Network'));
        console.log(chalk.gray('    4. Procure por "science" e copie o "authorization" do Headers\n'));
        
        rl.question(chalk.white('    Digite seu token do Discord: '), async (userToken) => {
            token = userToken;
            console.log(chalk.yellow('\n    🔄 Autenticando...'));
            
            try {
                await client.login(token);
                console.log(chalk.green('\n    ✅ Login realizado com sucesso!'));
                await sleep(1000);
                callback();
            } catch (error) {
                console.log(chalk.red('\n    ❌ Token inválido! Tente novamente.'));
                token = null;
                await sleep(2000);
                showWelcome();
            }
        });
    } else {
        if (!client.user) {
            console.log(chalk.yellow('\n    🔄 Reconectando...'));
            try {
                await client.login(token);
                console.log(chalk.green('\n    ✅ Reconectado com sucesso!'));
                await sleep(1000);
                callback();
            } catch (error) {
                console.log(chalk.red('\n    ❌ Token expirado! Por favor, faça login novamente.'));
                token = null;
                await sleep(2000);
                showWelcome();
            }
        } else {
            callback();
        }
    }
}

async function handleOption(option) {
    switch (option) {
        case '1':
            authenticateUser(() => {
                rl.question('\x1b[37m    Digite o ID do usuário: \x1b[0m', async (userId) => {
                    await clearDM(userId);
                    setTimeout(showWelcome, 500);
                });
            });
            break;
        case '2':
            authenticateUser(async () => {
                await removeAllFriends();
                setTimeout(showWelcome, 500);
            });
            break;
        case '3':
            authenticateUser(() => {
                antiDMActive = !antiDMActive;
                console.log('\x1b[32m%s\x1b[0m', `\n    ✅ Anti-DM ${antiDMActive ? 'ativado' : 'desativado'}`);
                setTimeout(showWelcome, 500);
            });
            break;
        case '4':
            authenticateUser(() => {
                rl.question('\x1b[37m    Digite o ID do canal de voz atual: \x1b[0m', (sourceId) => {
                    rl.question('\x1b[37m    Digite o ID do canal de voz destino: \x1b[0m', async (targetId) => {
                        await moveUsers(sourceId, targetId);
                        setTimeout(showWelcome, 500);
                    });
                });
            });
            break;
        case '5':
            showConfigMenu();
            break;
        case '6':
            console.log(chalk.cyan('\n    Obrigado por usar o Multi-Tools by Future! Até logo!\n'));
            setTimeout(() => process.exit(), 1500);
            break;
        default:
            console.log('\x1b[31m%s\x1b[0m', '\n    ❌ Opção inválida!');
            setTimeout(showWelcome, 500);
    }
}

async function clearDM(userId) {
    try {
        const channel = await client.users.fetch(userId);
        const dmChannel = await channel.createDM();
        const messages = await dmChannel.messages.fetch();
        
        const promises = [];
        for (const message of messages.values()) {
            if (message.author.id === client.user.id) {
                promises.push(message.delete().catch(() => {}));
            }
        }
        await Promise.all(promises);
        console.log('\x1b[32m%s\x1b[0m', `\n    ✅ DMs com ${channel.tag} foram limpas!`);
    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', '\n    ❌ Erro ao limpar DMs:', error);
    }
}

async function removeAllFriends() {
    try {
        
        const response = await client.api.users['@me'].relationships.get();
        const friends = response.filter(r => r.type === 1); // feito por future

        if (!friends || friends.length === 0) {
            console.log('\x1b[33m%s\x1b[0m', '\n    ℹ️ Nenhum amigo encontrado para remover.');
            return;
        }

        console.log('\x1b[36m%s\x1b[0m', `\n    🔍 Encontrados ${friends.length} amigos. Iniciando remoção...`);
        let count = 0;

        for (const friend of friends) {
            try {
                
                await client.api.users['@me'].relationships[friend.id].delete();
                
                count++;
                console.log('\x1b[32m%s\x1b[0m', `    ✅ Amigo removido: ${friend.user.username || friend.id}`);
                
                await new Promise(resolve => setTimeout(resolve, config.delayBetweenActions));
            } catch (err) {
                console.log('\x1b[31m%s\x1b[0m', `    ❌ Erro ao remover: ${friend.user.username || friend.id}`);
                continue;
            }
        }

        if (count > 0) {
            console.log('\x1b[32m%s\x1b[0m', `\n    ✅ ${count} amigos foram removidos com sucesso!`);
        } else {
            console.log('\x1b[31m%s\x1b[0m', '\n    ❌ Não foi possível remover nenhum amigo.');
        }
    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', '\n    ❌ Erro ao remover amigos. Tente novamente.');
        console.error(error);
    }
}

client.on('channelCreate', async (channel) => {
    if (antiDMActive && channel.type === 'GROUP_DM') {
        try {
            if (channel.type === 'GROUP_DM') {
                await channel.delete().catch(() => {});
                if (channel.recipients && channel.recipients.size > 0) {
                    await channel.recipients.forEach(async (recipient) => {
                        await recipient.deleteDM().catch(() => {});
                    });
                }
            }
            console.log('\x1b[32m%s\x1b[0m', '\n    ✅ Saiu automaticamente de um novo grupo DM');
        } catch (error) {
            try {
                await client.channels.remove(channel.id).catch(() => {});
                console.log('\x1b[32m%s\x1b[0m', '\n    ✅ Saiu automaticamente de um novo grupo DM');
            } catch (secondError) {
                console.log('\x1b[31m%s\x1b[0m', '\n    ❌ Erro ao sair do grupo. Tente novamente.');
            }
        }
    }
});

async function moveUsers(sourceChannelId, targetChannelId) {
    try {
        // feito por future
        const sourceChannel = await client.channels.fetch(sourceChannelId);
        const targetChannel = await client.channels.fetch(targetChannelId);

        if (!sourceChannel || !targetChannel) {
            console.log('\x1b[31m%s\x1b[0m', '\n    ❌ Um ou mais canais não foram encontrados!');
            return;
        }

        if (sourceChannel.type !== 'GUILD_VOICE' || targetChannel.type !== 'GUILD_VOICE') {
            console.log('\x1b[31m%s\x1b[0m', '\n    ❌ Um ou mais IDs não são de canais de voz!');
            return;
        }

        
        const guild = sourceChannel.guild;
        const member = await guild.members.fetch(client.user.id);
        
        if (!member.permissions.has('MOVE_MEMBERS')) {
            console.log('\x1b[31m%s\x1b[0m', '\n    ❌ Você não tem permissão para mover membros!');
            return;
        }

        
        const members = sourceChannel.members;
        
        if (!members || members.size === 0) {
            console.log('\x1b[33m%s\x1b[0m', '\n    ℹ️ Nenhum usuário encontrado no canal de origem.');
            return;
        }

        console.log('\x1b[36m%s\x1b[0m', `\n    🔍 Encontrados ${members.size} usuários. Iniciando movimentação...`);
        let count = 0;

        
        for (const [id, member] of members) {
            try {
                await member.voice.setChannel(targetChannel);
                count++;
                console.log('\x1b[32m%s\x1b[0m', `    ✅ Usuário movido: ${member.user.username}`);
                // feito por future
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.log('\x1b[31m%s\x1b[0m', `    ❌ Erro ao mover: ${member.user.username}`);
                continue;
            }
        }

        if (count > 0) {
            console.log('\x1b[32m%s\x1b[0m', `\n    ✅ ${count} usuários foram movidos com sucesso!`);
        } else {
            console.log('\x1b[31m%s\x1b[0m', '\n    ❌ Não foi possível mover nenhum usuário.');
        }

    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', '\n    ❌ Erro ao mover usuários:', error);
    }
}

async function showConfigMenu() {
    console.clear();
    await showTitle();
    
    console.log(chalk.cyan('\n    ═══════════════════ Configurações by Future ═══════════════════\n'));
    
    console.log(chalk.yellow('    [1] Delay entre ações: ') + chalk.white(`${config.delayBetweenActions}ms`));
    console.log(chalk.yellow('    [2] Notificações: ') + chalk.white(`${config.showNotifications ? 'Ativadas' : 'Desativadas'}`));
    console.log(chalk.yellow('    [3] Auto Reconexão: ') + chalk.white(`${config.autoReconnect ? 'Ativada' : 'Desativada'}`));
    console.log(chalk.yellow('    [4] Modo Seguro: ') + chalk.white(`${config.safeMode ? 'Ativado' : 'Desativado'}`));
    console.log(chalk.yellow('    [5] Voltar'));
    
    console.log(chalk.cyan('\n    ═════════════════════════════════════════════════\n'));
    
    rl.question(chalk.white('    Escolha uma opção: '), async (choice) => {
        switch (choice) {
            case '1':
                rl.question(chalk.white('    Digite o novo delay (em ms): '), (delay) => {
                    const newDelay = parseInt(delay);
                    if (!isNaN(newDelay) && newDelay >= 0) {
                        config.delayBetweenActions = newDelay;
                        console.log(chalk.green('\n    ✅ Delay atualizado com sucesso!'));
                    } else {
                        console.log(chalk.red('\n    ❌ Valor inválido!'));
                    }
                    setTimeout(showConfigMenu, 1500);
                });
                break;
                
            case '2':
                config.showNotifications = !config.showNotifications;
                console.log(chalk.green(`\n    ✅ Notificações ${config.showNotifications ? 'ativadas' : 'desativadas'}!`));
                setTimeout(showConfigMenu, 1500);
                break;
                
            case '3':
                config.autoReconnect = !config.autoReconnect;
                console.log(chalk.green(`\n    ✅ Auto Reconexão ${config.autoReconnect ? 'ativada' : 'desativada'}!`));
                setTimeout(showConfigMenu, 1500);
                break;
                
            case '4':
                config.safeMode = !config.safeMode;
                console.log(chalk.green(`\n    ✅ Modo Seguro ${config.safeMode ? 'ativado' : 'desativado'}!`));
                setTimeout(showConfigMenu, 1500);
                break;
                
            case '5':
                showWelcome();
                break;
                
            default:
                console.log(chalk.red('\n    ❌ Opção inválida!'));
                setTimeout(showConfigMenu, 1500);
                break;
        }
    });
}


async function initialize() {
    await showLoadingAnimation();
    showWelcome();
}

initialize(); 